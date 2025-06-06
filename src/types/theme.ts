export interface ComponentVariants {
    default: string;
    primary: string;
    destructive: string;
    success: string;
    warning: string;
    outline?: string;
    secondary?: string;
    ghost?: string;
    link?: string;
  }
  
  export interface ComponentSizes {
    sm: string;
    default: string;
    lg: string;
    icon?: string;
  }
  
  export interface ButtonTheme {
    base: string;
    variants: ComponentVariants;
    sizes: ComponentSizes;
    shadows?: ComponentVariants; // Shadow colors for each variant
    border?: {
      size: number;
      cutCorners: boolean;
    };
  }
  export interface CardTheme {
    base: string;
    variants?: {
      default: string;
      primary: string;
      destructive: string;
      outline: string;
      secondary: string;
      ghost: string;
    };
    border?: {
      size: number;
      cutCorners: boolean;
    };
  }
  

  export interface InputTheme {
    base: string;
    backgroundColor?: string;
    variants?: {
      default: string;
      primary: string;
      destructive: string;
      outline: string;
      secondary: string;
      ghost: string;
      filled: string;
      success: string;
      warning: string;
    };
    sizes?: {
      sm: string;
      default: string;
      lg: string;
      xl: string;
    };
    border?: {
      size: number;
      cutCorners: boolean;
    };
  }

  export interface SelectTheme {
    base: string;
    variants?: Record<string, string>;
    sizes?: Record<string, string>;
    border?: {
      size: number;
      cutCorners: boolean;
    };
  }
  
  export interface Theme {
    id: string;
    name: string;
    type: 'modern' | 'pixel';
    cssVars: Record<string, string>;
    components: {
      button: ButtonTheme;
      input: InputTheme;
      card: CardTheme;
      select: SelectTheme;
    };
  }
  
  export interface ComponentTheme {
    variants: Record<string, string>;
    sizes: Record<string, string>;
    base: string;
    pixelBorder?: {
      size: number;
      cutCorners: boolean;
    };
  }