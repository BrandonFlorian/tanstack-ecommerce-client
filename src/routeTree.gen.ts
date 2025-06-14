/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as SignupImport } from './routes/signup'
import { Route as RedirectImport } from './routes/redirect'
import { Route as OrdersImport } from './routes/orders'
import { Route as OrderConfirmationImport } from './routes/order-confirmation'
import { Route as LogoutImport } from './routes/logout'
import { Route as LoginImport } from './routes/login'
import { Route as DeferredImport } from './routes/deferred'
import { Route as CheckoutImport } from './routes/checkout'
import { Route as CategoriesImport } from './routes/categories'
import { Route as CartImport } from './routes/cart'
import { Route as AuthedImport } from './routes/_authed'
import { Route as IndexImport } from './routes/index'
import { Route as ProductsIndexImport } from './routes/products.index'
import { Route as ProductsProductIdImport } from './routes/products.$productId'
import { Route as OrdersOrderIdImport } from './routes/orders.$orderId'
import { Route as CategoriesCategoryIdImport } from './routes/categories.$categoryId'
import { Route as AuthedProfileImport } from './routes/_authed/profile'

// Create/Update Routes

const SignupRoute = SignupImport.update({
  id: '/signup',
  path: '/signup',
  getParentRoute: () => rootRoute,
} as any)

const RedirectRoute = RedirectImport.update({
  id: '/redirect',
  path: '/redirect',
  getParentRoute: () => rootRoute,
} as any)

const OrdersRoute = OrdersImport.update({
  id: '/orders',
  path: '/orders',
  getParentRoute: () => rootRoute,
} as any)

const OrderConfirmationRoute = OrderConfirmationImport.update({
  id: '/order-confirmation',
  path: '/order-confirmation',
  getParentRoute: () => rootRoute,
} as any)

const LogoutRoute = LogoutImport.update({
  id: '/logout',
  path: '/logout',
  getParentRoute: () => rootRoute,
} as any)

const LoginRoute = LoginImport.update({
  id: '/login',
  path: '/login',
  getParentRoute: () => rootRoute,
} as any)

const DeferredRoute = DeferredImport.update({
  id: '/deferred',
  path: '/deferred',
  getParentRoute: () => rootRoute,
} as any)

const CheckoutRoute = CheckoutImport.update({
  id: '/checkout',
  path: '/checkout',
  getParentRoute: () => rootRoute,
} as any)

const CategoriesRoute = CategoriesImport.update({
  id: '/categories',
  path: '/categories',
  getParentRoute: () => rootRoute,
} as any)

const CartRoute = CartImport.update({
  id: '/cart',
  path: '/cart',
  getParentRoute: () => rootRoute,
} as any)

const AuthedRoute = AuthedImport.update({
  id: '/_authed',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const ProductsIndexRoute = ProductsIndexImport.update({
  id: '/products/',
  path: '/products/',
  getParentRoute: () => rootRoute,
} as any)

const ProductsProductIdRoute = ProductsProductIdImport.update({
  id: '/products/$productId',
  path: '/products/$productId',
  getParentRoute: () => rootRoute,
} as any)

const OrdersOrderIdRoute = OrdersOrderIdImport.update({
  id: '/$orderId',
  path: '/$orderId',
  getParentRoute: () => OrdersRoute,
} as any)

const CategoriesCategoryIdRoute = CategoriesCategoryIdImport.update({
  id: '/$categoryId',
  path: '/$categoryId',
  getParentRoute: () => CategoriesRoute,
} as any)

const AuthedProfileRoute = AuthedProfileImport.update({
  id: '/profile',
  path: '/profile',
  getParentRoute: () => AuthedRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/_authed': {
      id: '/_authed'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof AuthedImport
      parentRoute: typeof rootRoute
    }
    '/cart': {
      id: '/cart'
      path: '/cart'
      fullPath: '/cart'
      preLoaderRoute: typeof CartImport
      parentRoute: typeof rootRoute
    }
    '/categories': {
      id: '/categories'
      path: '/categories'
      fullPath: '/categories'
      preLoaderRoute: typeof CategoriesImport
      parentRoute: typeof rootRoute
    }
    '/checkout': {
      id: '/checkout'
      path: '/checkout'
      fullPath: '/checkout'
      preLoaderRoute: typeof CheckoutImport
      parentRoute: typeof rootRoute
    }
    '/deferred': {
      id: '/deferred'
      path: '/deferred'
      fullPath: '/deferred'
      preLoaderRoute: typeof DeferredImport
      parentRoute: typeof rootRoute
    }
    '/login': {
      id: '/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof LoginImport
      parentRoute: typeof rootRoute
    }
    '/logout': {
      id: '/logout'
      path: '/logout'
      fullPath: '/logout'
      preLoaderRoute: typeof LogoutImport
      parentRoute: typeof rootRoute
    }
    '/order-confirmation': {
      id: '/order-confirmation'
      path: '/order-confirmation'
      fullPath: '/order-confirmation'
      preLoaderRoute: typeof OrderConfirmationImport
      parentRoute: typeof rootRoute
    }
    '/orders': {
      id: '/orders'
      path: '/orders'
      fullPath: '/orders'
      preLoaderRoute: typeof OrdersImport
      parentRoute: typeof rootRoute
    }
    '/redirect': {
      id: '/redirect'
      path: '/redirect'
      fullPath: '/redirect'
      preLoaderRoute: typeof RedirectImport
      parentRoute: typeof rootRoute
    }
    '/signup': {
      id: '/signup'
      path: '/signup'
      fullPath: '/signup'
      preLoaderRoute: typeof SignupImport
      parentRoute: typeof rootRoute
    }
    '/_authed/profile': {
      id: '/_authed/profile'
      path: '/profile'
      fullPath: '/profile'
      preLoaderRoute: typeof AuthedProfileImport
      parentRoute: typeof AuthedImport
    }
    '/categories/$categoryId': {
      id: '/categories/$categoryId'
      path: '/$categoryId'
      fullPath: '/categories/$categoryId'
      preLoaderRoute: typeof CategoriesCategoryIdImport
      parentRoute: typeof CategoriesImport
    }
    '/orders/$orderId': {
      id: '/orders/$orderId'
      path: '/$orderId'
      fullPath: '/orders/$orderId'
      preLoaderRoute: typeof OrdersOrderIdImport
      parentRoute: typeof OrdersImport
    }
    '/products/$productId': {
      id: '/products/$productId'
      path: '/products/$productId'
      fullPath: '/products/$productId'
      preLoaderRoute: typeof ProductsProductIdImport
      parentRoute: typeof rootRoute
    }
    '/products/': {
      id: '/products/'
      path: '/products'
      fullPath: '/products'
      preLoaderRoute: typeof ProductsIndexImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

interface AuthedRouteChildren {
  AuthedProfileRoute: typeof AuthedProfileRoute
}

const AuthedRouteChildren: AuthedRouteChildren = {
  AuthedProfileRoute: AuthedProfileRoute,
}

const AuthedRouteWithChildren =
  AuthedRoute._addFileChildren(AuthedRouteChildren)

interface CategoriesRouteChildren {
  CategoriesCategoryIdRoute: typeof CategoriesCategoryIdRoute
}

const CategoriesRouteChildren: CategoriesRouteChildren = {
  CategoriesCategoryIdRoute: CategoriesCategoryIdRoute,
}

const CategoriesRouteWithChildren = CategoriesRoute._addFileChildren(
  CategoriesRouteChildren,
)

interface OrdersRouteChildren {
  OrdersOrderIdRoute: typeof OrdersOrderIdRoute
}

const OrdersRouteChildren: OrdersRouteChildren = {
  OrdersOrderIdRoute: OrdersOrderIdRoute,
}

const OrdersRouteWithChildren =
  OrdersRoute._addFileChildren(OrdersRouteChildren)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '': typeof AuthedRouteWithChildren
  '/cart': typeof CartRoute
  '/categories': typeof CategoriesRouteWithChildren
  '/checkout': typeof CheckoutRoute
  '/deferred': typeof DeferredRoute
  '/login': typeof LoginRoute
  '/logout': typeof LogoutRoute
  '/order-confirmation': typeof OrderConfirmationRoute
  '/orders': typeof OrdersRouteWithChildren
  '/redirect': typeof RedirectRoute
  '/signup': typeof SignupRoute
  '/profile': typeof AuthedProfileRoute
  '/categories/$categoryId': typeof CategoriesCategoryIdRoute
  '/orders/$orderId': typeof OrdersOrderIdRoute
  '/products/$productId': typeof ProductsProductIdRoute
  '/products': typeof ProductsIndexRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '': typeof AuthedRouteWithChildren
  '/cart': typeof CartRoute
  '/categories': typeof CategoriesRouteWithChildren
  '/checkout': typeof CheckoutRoute
  '/deferred': typeof DeferredRoute
  '/login': typeof LoginRoute
  '/logout': typeof LogoutRoute
  '/order-confirmation': typeof OrderConfirmationRoute
  '/orders': typeof OrdersRouteWithChildren
  '/redirect': typeof RedirectRoute
  '/signup': typeof SignupRoute
  '/profile': typeof AuthedProfileRoute
  '/categories/$categoryId': typeof CategoriesCategoryIdRoute
  '/orders/$orderId': typeof OrdersOrderIdRoute
  '/products/$productId': typeof ProductsProductIdRoute
  '/products': typeof ProductsIndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/_authed': typeof AuthedRouteWithChildren
  '/cart': typeof CartRoute
  '/categories': typeof CategoriesRouteWithChildren
  '/checkout': typeof CheckoutRoute
  '/deferred': typeof DeferredRoute
  '/login': typeof LoginRoute
  '/logout': typeof LogoutRoute
  '/order-confirmation': typeof OrderConfirmationRoute
  '/orders': typeof OrdersRouteWithChildren
  '/redirect': typeof RedirectRoute
  '/signup': typeof SignupRoute
  '/_authed/profile': typeof AuthedProfileRoute
  '/categories/$categoryId': typeof CategoriesCategoryIdRoute
  '/orders/$orderId': typeof OrdersOrderIdRoute
  '/products/$productId': typeof ProductsProductIdRoute
  '/products/': typeof ProductsIndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | ''
    | '/cart'
    | '/categories'
    | '/checkout'
    | '/deferred'
    | '/login'
    | '/logout'
    | '/order-confirmation'
    | '/orders'
    | '/redirect'
    | '/signup'
    | '/profile'
    | '/categories/$categoryId'
    | '/orders/$orderId'
    | '/products/$productId'
    | '/products'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | ''
    | '/cart'
    | '/categories'
    | '/checkout'
    | '/deferred'
    | '/login'
    | '/logout'
    | '/order-confirmation'
    | '/orders'
    | '/redirect'
    | '/signup'
    | '/profile'
    | '/categories/$categoryId'
    | '/orders/$orderId'
    | '/products/$productId'
    | '/products'
  id:
    | '__root__'
    | '/'
    | '/_authed'
    | '/cart'
    | '/categories'
    | '/checkout'
    | '/deferred'
    | '/login'
    | '/logout'
    | '/order-confirmation'
    | '/orders'
    | '/redirect'
    | '/signup'
    | '/_authed/profile'
    | '/categories/$categoryId'
    | '/orders/$orderId'
    | '/products/$productId'
    | '/products/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AuthedRoute: typeof AuthedRouteWithChildren
  CartRoute: typeof CartRoute
  CategoriesRoute: typeof CategoriesRouteWithChildren
  CheckoutRoute: typeof CheckoutRoute
  DeferredRoute: typeof DeferredRoute
  LoginRoute: typeof LoginRoute
  LogoutRoute: typeof LogoutRoute
  OrderConfirmationRoute: typeof OrderConfirmationRoute
  OrdersRoute: typeof OrdersRouteWithChildren
  RedirectRoute: typeof RedirectRoute
  SignupRoute: typeof SignupRoute
  ProductsProductIdRoute: typeof ProductsProductIdRoute
  ProductsIndexRoute: typeof ProductsIndexRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AuthedRoute: AuthedRouteWithChildren,
  CartRoute: CartRoute,
  CategoriesRoute: CategoriesRouteWithChildren,
  CheckoutRoute: CheckoutRoute,
  DeferredRoute: DeferredRoute,
  LoginRoute: LoginRoute,
  LogoutRoute: LogoutRoute,
  OrderConfirmationRoute: OrderConfirmationRoute,
  OrdersRoute: OrdersRouteWithChildren,
  RedirectRoute: RedirectRoute,
  SignupRoute: SignupRoute,
  ProductsProductIdRoute: ProductsProductIdRoute,
  ProductsIndexRoute: ProductsIndexRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/_authed",
        "/cart",
        "/categories",
        "/checkout",
        "/deferred",
        "/login",
        "/logout",
        "/order-confirmation",
        "/orders",
        "/redirect",
        "/signup",
        "/products/$productId",
        "/products/"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/_authed": {
      "filePath": "_authed.tsx",
      "children": [
        "/_authed/profile"
      ]
    },
    "/cart": {
      "filePath": "cart.tsx"
    },
    "/categories": {
      "filePath": "categories.tsx",
      "children": [
        "/categories/$categoryId"
      ]
    },
    "/checkout": {
      "filePath": "checkout.tsx"
    },
    "/deferred": {
      "filePath": "deferred.tsx"
    },
    "/login": {
      "filePath": "login.tsx"
    },
    "/logout": {
      "filePath": "logout.tsx"
    },
    "/order-confirmation": {
      "filePath": "order-confirmation.tsx"
    },
    "/orders": {
      "filePath": "orders.tsx",
      "children": [
        "/orders/$orderId"
      ]
    },
    "/redirect": {
      "filePath": "redirect.tsx"
    },
    "/signup": {
      "filePath": "signup.tsx"
    },
    "/_authed/profile": {
      "filePath": "_authed/profile.tsx",
      "parent": "/_authed"
    },
    "/categories/$categoryId": {
      "filePath": "categories.$categoryId.tsx",
      "parent": "/categories"
    },
    "/orders/$orderId": {
      "filePath": "orders.$orderId.tsx",
      "parent": "/orders"
    },
    "/products/$productId": {
      "filePath": "products.$productId.tsx"
    },
    "/products/": {
      "filePath": "products.index.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
