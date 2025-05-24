

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."add_item_to_cart"("p_product_id" "uuid", "p_quantity" integer DEFAULT 1, "p_user_id" "uuid" DEFAULT NULL::"uuid", "p_session_id" "text" DEFAULT NULL::"text") RETURNS TABLE("cart_id" "uuid", "user_id" "uuid", "session_id" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "items" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_cart_id UUID;
  v_item_id UUID;
  v_current_quantity INTEGER;
BEGIN
  -- Validate input
  IF p_user_id IS NULL AND p_session_id IS NULL THEN
    RAISE EXCEPTION 'Either user_id or session_id must be provided';
  END IF;
  
  IF p_product_id IS NULL THEN
    RAISE EXCEPTION 'Product ID is required';
  END IF;
  
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'Quantity must be greater than 0';
  END IF;
  
  -- Get or create cart
  SELECT c.id INTO v_cart_id
  FROM carts c
  WHERE (p_user_id IS NOT NULL AND c.user_id = p_user_id)
     OR (p_session_id IS NOT NULL AND c.session_id = p_session_id)
  LIMIT 1;
  
  -- Create cart if none exists
  IF v_cart_id IS NULL THEN
    INSERT INTO carts (user_id, session_id)
    VALUES (p_user_id, p_session_id)
    RETURNING id INTO v_cart_id;
  END IF;
  
  -- Check if item already exists in cart
  SELECT ci.id, ci.quantity 
  INTO v_item_id, v_current_quantity
  FROM cart_items ci
  WHERE ci.cart_id = v_cart_id AND ci.product_id = p_product_id;
  
  -- Update existing item or add new one
  IF v_item_id IS NOT NULL THEN
    UPDATE cart_items
    SET quantity = v_current_quantity + p_quantity,
        updated_at = NOW()
    WHERE id = v_item_id;
  ELSE
    INSERT INTO cart_items (cart_id, product_id, quantity)
    VALUES (v_cart_id, p_product_id, p_quantity);
  END IF;
  
  -- Update cart timestamp
  UPDATE carts
  SET updated_at = NOW()
  WHERE id = v_cart_id;
  
  -- Return the updated cart with items
  RETURN QUERY SELECT * FROM get_or_create_cart_with_items(p_user_id, p_session_id);
END;
$$;


ALTER FUNCTION "public"."add_item_to_cart"("p_product_id" "uuid", "p_quantity" integer, "p_user_id" "uuid", "p_session_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."clear_cart"("p_user_id" "uuid" DEFAULT NULL::"uuid", "p_session_id" "text" DEFAULT NULL::"text") RETURNS TABLE("cart_id" "uuid", "user_id" "uuid", "session_id" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "items" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_cart_id UUID;
BEGIN
  -- Validate input
  IF p_user_id IS NULL AND p_session_id IS NULL THEN
    RAISE EXCEPTION 'Either user_id or session_id must be provided';
  END IF;
  
  -- Get cart
  SELECT c.id INTO v_cart_id
  FROM carts c
  WHERE (p_user_id IS NOT NULL AND c.user_id = p_user_id)
     OR (p_session_id IS NOT NULL AND c.session_id = p_session_id)
  LIMIT 1;
  
  -- Check if cart exists
  IF v_cart_id IS NULL THEN
    RAISE EXCEPTION 'Cart not found';
  END IF;
  
  -- Remove all items
  DELETE FROM cart_items ci
  WHERE ci.cart_id = v_cart_id;
  
  -- Update cart timestamp
  UPDATE carts
  SET updated_at = NOW()
  WHERE id = v_cart_id;
  
  -- Return the updated cart with items (which will be empty)
  RETURN QUERY SELECT * FROM get_or_create_cart_with_items(p_user_id, p_session_id);
END;
$$;


ALTER FUNCTION "public"."clear_cart"("p_user_id" "uuid", "p_session_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_or_create_cart_with_items"("p_user_id" "uuid" DEFAULT NULL::"uuid", "p_session_id" "text" DEFAULT NULL::"text") RETURNS TABLE("cart_id" "uuid", "user_id" "uuid", "session_id" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "items" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_cart_id UUID;
BEGIN
  -- Validate input - at least one identifier must be provided
  IF p_user_id IS NULL AND p_session_id IS NULL THEN
    RAISE EXCEPTION 'Either user_id or session_id must be provided';
  END IF;
  
  -- First, try to find an existing cart
  SELECT c.id INTO v_cart_id
  FROM carts c
  WHERE (p_user_id IS NOT NULL AND c.user_id = p_user_id)
     OR (p_session_id IS NOT NULL AND c.session_id = p_session_id)
  LIMIT 1;
  
  -- If no cart exists, create one
  IF v_cart_id IS NULL THEN
    INSERT INTO carts (user_id, session_id)
    VALUES (p_user_id, p_session_id)
    RETURNING id INTO v_cart_id;
  END IF;
  
  -- Return cart with items
  RETURN QUERY
  SELECT 
    c.id AS cart_id,
    c.user_id,
    c.session_id,
    c.created_at,
    c.updated_at,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', ci.id,
            'product_id', ci.product_id,
            'quantity', ci.quantity,
            'product', jsonb_build_object(
              'id', p.id,
              'name', p.name,
              'price', p.price,
              'compare_at_price', p.compare_at_price,
              'sku', p.sku,
              'inventory_quantity', p.inventory_quantity,
              'primary_image', (
                SELECT jsonb_build_object(
                  'id', pi.id,
                  'url', pi.url,
                  'alt_text', pi.alt_text
                )
                FROM product_images pi
                WHERE pi.product_id = p.id AND pi.is_primary = true
                LIMIT 1
              )
            )
          )
        )
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.cart_id = c.id
      ),
      '[]'::jsonb
    ) AS items
  FROM carts c
  WHERE c.id = v_cart_id;
END;
$$;


ALTER FUNCTION "public"."get_or_create_cart_with_items"("p_user_id" "uuid", "p_session_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Skip profile creation for anonymous users (they don't have emails)
  IF NEW.email IS NULL AND NEW.is_anonymous = true THEN
    RETURN NEW;
  END IF;
  
  -- Only create profile for users with emails (non-anonymous)
  IF NEW.email IS NOT NULL THEN
    BEGIN
      INSERT INTO public.user_profiles (
        id,
        email,
        first_name,
        last_name,
        role,
        created_at
      ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        'customer', -- Default role for new users
        NEW.created_at
      );
    EXCEPTION
      WHEN unique_violation THEN
        RAISE NOTICE 'User with email % already exists.', NEW.email;
        -- Handle the error as needed, e.g., log it or take other actions
    END;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_inventory"("p_product_id" "uuid", "p_quantity" integer) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE products
  SET inventory_quantity = inventory_quantity + p_quantity,
      updated_at = now()
  WHERE id = p_product_id;
END;
$$;


ALTER FUNCTION "public"."increment_inventory"("p_product_id" "uuid", "p_quantity" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."merge_carts"("p_user_id" "uuid", "p_session_id" "text") RETURNS TABLE("cart_id" "uuid", "user_id" "uuid", "session_id" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "items" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_user_cart_id UUID;
  v_session_cart_id UUID;
  v_merged_cart_id UUID;
BEGIN
  -- Validate input
  IF p_user_id IS NULL OR p_session_id IS NULL THEN
    RAISE EXCEPTION 'Both user_id and session_id must be provided';
  END IF;
  
  -- Get user cart
  SELECT c.id INTO v_user_cart_id
  FROM carts c
  WHERE c.user_id = p_user_id
  LIMIT 1;
  
  -- Get session cart
  SELECT c.id INTO v_session_cart_id
  FROM carts c
  WHERE c.session_id = p_session_id AND (c.user_id IS NULL OR c.user_id != p_user_id)
  LIMIT 1;
  
  -- If no session cart exists, just return the user cart (or create one)
  IF v_session_cart_id IS NULL THEN
    RETURN QUERY SELECT * FROM get_or_create_cart_with_items(p_user_id, NULL);
    RETURN;
  END IF;
  
  -- If no user cart exists, update the session cart to belong to the user
  IF v_user_cart_id IS NULL THEN
    UPDATE carts
    SET user_id = p_user_id,
        updated_at = NOW()
    WHERE id = v_session_cart_id;
    
    v_merged_cart_id := v_session_cart_id;
  ELSE
    -- Both carts exist, merge items from session cart to user cart
    -- For each item in session cart, add or update quantity in user cart
    INSERT INTO cart_items (cart_id, product_id, quantity)
    SELECT v_user_cart_id, ci.product_id, ci.quantity
    FROM cart_items ci
    WHERE ci.cart_id = v_session_cart_id
    ON CONFLICT (cart_id, product_id) DO UPDATE
    SET quantity = cart_items.quantity + EXCLUDED.quantity,
        updated_at = NOW();
    
    -- Delete session cart and its items (cascade will handle items)
    DELETE FROM carts WHERE id = v_session_cart_id;
    
    v_merged_cart_id := v_user_cart_id;
  END IF;
  
  -- Update cart timestamp
  UPDATE carts
  SET updated_at = NOW()
  WHERE id = v_merged_cart_id;
  
  -- Return the merged cart with items
  RETURN QUERY SELECT * FROM get_or_create_cart_with_items(p_user_id, NULL);
END;
$$;


ALTER FUNCTION "public"."merge_carts"("p_user_id" "uuid", "p_session_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."remove_item_from_cart"("p_product_id" "uuid", "p_user_id" "uuid" DEFAULT NULL::"uuid", "p_session_id" "text" DEFAULT NULL::"text") RETURNS TABLE("cart_id" "uuid", "user_id" "uuid", "session_id" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "items" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_cart_id UUID;
BEGIN
  -- Validate input
  IF p_user_id IS NULL AND p_session_id IS NULL THEN
    RAISE EXCEPTION 'Either user_id or session_id must be provided';
  END IF;
  
  IF p_product_id IS NULL THEN
    RAISE EXCEPTION 'Product ID is required';
  END IF;
  
  -- Get cart
  SELECT c.id INTO v_cart_id
  FROM carts c
  WHERE (p_user_id IS NOT NULL AND c.user_id = p_user_id)
     OR (p_session_id IS NOT NULL AND c.session_id = p_session_id)
  LIMIT 1;
  
  -- Check if cart exists
  IF v_cart_id IS NULL THEN
    RAISE EXCEPTION 'Cart not found';
  END IF;
  
  -- Remove the item
  DELETE FROM cart_items ci
  WHERE ci.cart_id = v_cart_id AND ci.product_id = p_product_id;
  
  -- Update cart timestamp
  UPDATE carts
  SET updated_at = NOW()
  WHERE id = v_cart_id;
  
  -- Return the updated cart with items
  RETURN QUERY SELECT * FROM get_or_create_cart_with_items(p_user_id, p_session_id);
END;
$$;


ALTER FUNCTION "public"."remove_item_from_cart"("p_product_id" "uuid", "p_user_id" "uuid", "p_session_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_cart_item_quantity"("p_product_id" "uuid", "p_quantity" integer, "p_user_id" "uuid" DEFAULT NULL::"uuid", "p_session_id" "text" DEFAULT NULL::"text") RETURNS TABLE("cart_id" "uuid", "user_id" "uuid", "session_id" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "items" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_cart_id UUID;
BEGIN
  -- Validate input
  IF p_user_id IS NULL AND p_session_id IS NULL THEN
    RAISE EXCEPTION 'Either user_id or session_id must be provided';
  END IF;
  
  IF p_product_id IS NULL THEN
    RAISE EXCEPTION 'Product ID is required';
  END IF;
  
  -- Get cart
  SELECT c.id INTO v_cart_id
  FROM carts c
  WHERE (p_user_id IS NOT NULL AND c.user_id = p_user_id)
     OR (p_session_id IS NOT NULL AND c.session_id = p_session_id)
  LIMIT 1;
  
  -- Check if cart exists
  IF v_cart_id IS NULL THEN
    RAISE EXCEPTION 'Cart not found';
  END IF;
  
  -- If quantity is 0 or less, remove the item
  IF p_quantity <= 0 THEN
    DELETE FROM cart_items ci
    WHERE ci.cart_id = v_cart_id AND ci.product_id = p_product_id;
  ELSE
    -- Update if exists, otherwise insert
    UPDATE cart_items ci
    SET quantity = p_quantity,
        updated_at = NOW()
    WHERE ci.cart_id = v_cart_id AND ci.product_id = p_product_id;
    
    -- If no rows were updated, the item doesn't exist in the cart
    IF NOT FOUND THEN
      INSERT INTO cart_items (cart_id, product_id, quantity)
      VALUES (v_cart_id, p_product_id, p_quantity);
    END IF;
  END IF;
  
  -- Update cart timestamp
  UPDATE carts
  SET updated_at = NOW()
  WHERE id = v_cart_id;
  
  -- Return the updated cart with items
  RETURN QUERY SELECT * FROM get_or_create_cart_with_items(p_user_id, p_session_id);
END;
$$;


ALTER FUNCTION "public"."update_cart_item_quantity"("p_product_id" "uuid", "p_quantity" integer, "p_user_id" "uuid", "p_session_id" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."addresses" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "address_line1" "text" NOT NULL,
    "address_line2" "text",
    "city" "text" NOT NULL,
    "state" "text" NOT NULL,
    "postal_code" "text" NOT NULL,
    "country" "text" NOT NULL,
    "is_default" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."addresses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cart_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "cart_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "quantity" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."cart_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."carts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "session_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."carts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "parent_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "quantity" integer NOT NULL,
    "unit_price" numeric(10,2) NOT NULL,
    "total_price" numeric(10,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."order_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "total_amount" numeric(10,2) NOT NULL,
    "subtotal" numeric(10,2) NOT NULL,
    "tax" numeric(10,2) NOT NULL,
    "shipping_cost" numeric(10,2) NOT NULL,
    "discount_amount" numeric(10,2) DEFAULT 0 NOT NULL,
    "stripe_payment_intent_id" "text",
    "billing_address_id" "uuid" NOT NULL,
    "shipping_address_id" "uuid" NOT NULL,
    "shipping_method" "text" NOT NULL,
    "tracking_number" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "receipt_url" "text",
    "payment_method_details" "jsonb",
    "dispute_status" "text",
    "dispute_reason" "text",
    "dispute_evidence" "jsonb",
    "dispute_created_at" timestamp with time zone,
    "dispute_resolved_at" timestamp with time zone,
    "fraud_warning" boolean DEFAULT false,
    "fraud_warning_details" "jsonb"
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_images" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "url" "text" NOT NULL,
    "alt_text" "text" NOT NULL,
    "position" integer NOT NULL,
    "is_primary" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."product_images" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "price" numeric(10,2) NOT NULL,
    "compare_at_price" numeric(10,2),
    "cost_price" numeric(10,2) NOT NULL,
    "sku" "text" NOT NULL,
    "barcode" "text",
    "weight" numeric(10,2) NOT NULL,
    "dimensions" "jsonb" NOT NULL,
    "inventory_quantity" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "category_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "phone" "text",
    "role" "text" DEFAULT 'customer'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."addresses"
    ADD CONSTRAINT "addresses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_cart_id_product_id_key" UNIQUE ("cart_id", "product_id");



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."carts"
    ADD CONSTRAINT "carts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_images"
    ADD CONSTRAINT "product_images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_sku_key" UNIQUE ("sku");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_addresses_user_id" ON "public"."addresses" USING "btree" ("user_id");



CREATE INDEX "idx_cart_items_cart_id" ON "public"."cart_items" USING "btree" ("cart_id");



CREATE INDEX "idx_cart_items_product_id" ON "public"."cart_items" USING "btree" ("product_id");



CREATE INDEX "idx_carts_session_id" ON "public"."carts" USING "btree" ("session_id");



CREATE INDEX "idx_carts_user_id" ON "public"."carts" USING "btree" ("user_id");



CREATE INDEX "idx_order_items_order_id" ON "public"."order_items" USING "btree" ("order_id");



CREATE INDEX "idx_order_items_product_id" ON "public"."order_items" USING "btree" ("product_id");



CREATE INDEX "idx_orders_dispute_status" ON "public"."orders" USING "btree" ("dispute_status");



CREATE INDEX "idx_orders_fraud_warning" ON "public"."orders" USING "btree" ("fraud_warning");



CREATE INDEX "idx_orders_status" ON "public"."orders" USING "btree" ("status");



CREATE INDEX "idx_orders_user_id" ON "public"."orders" USING "btree" ("user_id");



CREATE INDEX "idx_product_images_product_id" ON "public"."product_images" USING "btree" ("product_id");



CREATE INDEX "idx_products_category_id" ON "public"."products" USING "btree" ("category_id");



CREATE INDEX "idx_products_is_active" ON "public"."products" USING "btree" ("is_active");



CREATE INDEX "idx_users_email" ON "public"."user_profiles" USING "btree" ("email");



ALTER TABLE ONLY "public"."addresses"
    ADD CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."carts"
    ADD CONSTRAINT "carts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_billing_address_id_fkey" FOREIGN KEY ("billing_address_id") REFERENCES "public"."addresses"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_shipping_address_id_fkey" FOREIGN KEY ("shipping_address_id") REFERENCES "public"."addresses"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."product_images"
    ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id");



CREATE POLICY "Active products are publicly viewable" ON "public"."products" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Admin can delete all" ON "public"."cart_items" FOR DELETE USING ((("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "Admin can do all actions" ON "public"."cart_items" USING ((("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "Admin can manage all order items" ON "public"."order_items" USING ((("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "Admin can manage all orders" ON "public"."orders" USING ((("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "Admin can manage categories" ON "public"."categories" USING ((("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "Admin can manage product images" ON "public"."product_images" USING ((("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "Admin can manage products" ON "public"."products" USING ((("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "Admin can view all addresses" ON "public"."addresses" FOR SELECT USING ((("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "Admin can view all cart items" ON "public"."cart_items" FOR SELECT USING ((("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "Admin can view all carts" ON "public"."carts" FOR SELECT USING ((("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "Categories are publicly viewable" ON "public"."categories" FOR SELECT USING (true);



CREATE POLICY "Product images are publicly viewable" ON "public"."product_images" FOR SELECT USING (true);



CREATE POLICY "Users can CRUD their own addresses" ON "public"."addresses" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own profile" ON "public"."user_profiles" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id")));



CREATE POLICY "Users can manage their own cart items" ON "public"."cart_items" USING ((EXISTS ( SELECT 1
   FROM "public"."carts"
  WHERE (("carts"."id" = "cart_items"."cart_id") AND (("carts"."user_id" = "auth"."uid"()) OR (("carts"."user_id" IS NULL) AND ("carts"."session_id" = (("current_setting"('request.headers'::"text"))::"json" ->> 'cart-session-id'::"text"))))))));



CREATE POLICY "Users can manage their own carts" ON "public"."carts" USING ((("auth"."uid"() = "user_id") OR (("user_id" IS NULL) AND ("session_id" = (("current_setting"('request.headers'::"text"))::"json" ->> 'cart-session-id'::"text")))));



CREATE POLICY "Users can update their own profile" ON "public"."user_profiles" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id")));



CREATE POLICY "Users can view their own order items" ON "public"."order_items" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "order_items"."order_id") AND ("orders"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their own orders" ON "public"."orders" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own profile" ON "public"."user_profiles" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id")));



ALTER TABLE "public"."addresses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cart_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."carts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_images" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."add_item_to_cart"("p_product_id" "uuid", "p_quantity" integer, "p_user_id" "uuid", "p_session_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."add_item_to_cart"("p_product_id" "uuid", "p_quantity" integer, "p_user_id" "uuid", "p_session_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_item_to_cart"("p_product_id" "uuid", "p_quantity" integer, "p_user_id" "uuid", "p_session_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."clear_cart"("p_user_id" "uuid", "p_session_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."clear_cart"("p_user_id" "uuid", "p_session_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."clear_cart"("p_user_id" "uuid", "p_session_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_or_create_cart_with_items"("p_user_id" "uuid", "p_session_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_or_create_cart_with_items"("p_user_id" "uuid", "p_session_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_or_create_cart_with_items"("p_user_id" "uuid", "p_session_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_inventory"("p_product_id" "uuid", "p_quantity" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."increment_inventory"("p_product_id" "uuid", "p_quantity" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_inventory"("p_product_id" "uuid", "p_quantity" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."merge_carts"("p_user_id" "uuid", "p_session_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."merge_carts"("p_user_id" "uuid", "p_session_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."merge_carts"("p_user_id" "uuid", "p_session_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."remove_item_from_cart"("p_product_id" "uuid", "p_user_id" "uuid", "p_session_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."remove_item_from_cart"("p_product_id" "uuid", "p_user_id" "uuid", "p_session_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."remove_item_from_cart"("p_product_id" "uuid", "p_user_id" "uuid", "p_session_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_cart_item_quantity"("p_product_id" "uuid", "p_quantity" integer, "p_user_id" "uuid", "p_session_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_cart_item_quantity"("p_product_id" "uuid", "p_quantity" integer, "p_user_id" "uuid", "p_session_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_cart_item_quantity"("p_product_id" "uuid", "p_quantity" integer, "p_user_id" "uuid", "p_session_id" "text") TO "service_role";



























GRANT ALL ON TABLE "public"."addresses" TO "anon";
GRANT ALL ON TABLE "public"."addresses" TO "authenticated";
GRANT ALL ON TABLE "public"."addresses" TO "service_role";



GRANT ALL ON TABLE "public"."cart_items" TO "anon";
GRANT ALL ON TABLE "public"."cart_items" TO "authenticated";
GRANT ALL ON TABLE "public"."cart_items" TO "service_role";



GRANT ALL ON TABLE "public"."carts" TO "anon";
GRANT ALL ON TABLE "public"."carts" TO "authenticated";
GRANT ALL ON TABLE "public"."carts" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."order_items" TO "anon";
GRANT ALL ON TABLE "public"."order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."order_items" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."product_images" TO "anon";
GRANT ALL ON TABLE "public"."product_images" TO "authenticated";
GRANT ALL ON TABLE "public"."product_images" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
