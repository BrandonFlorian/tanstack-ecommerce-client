import { generateThemeStyles } from "@/lib/themes/server";
import { Theme } from "@/types/theme";

export function ServerThemeStyles({ theme }: { theme: Theme }) {
    const styles = generateThemeStyles(theme);
    
    return (
      <style
        dangerouslySetInnerHTML={{
          __html: `:root { ${styles} }`
        }}
      />
    );
  }