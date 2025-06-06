import { defaultTheme } from './defaultTheme';
import { nesTheme } from './nesTheme';
import { snesTheme } from './snesTheme';
import { Theme } from '@/types/theme';

export const themes: Theme[] = [defaultTheme, nesTheme, snesTheme];
export { defaultTheme, nesTheme, snesTheme };
export type { Theme, ComponentVariants, ComponentSizes, ButtonTheme } from '@/types/theme';

