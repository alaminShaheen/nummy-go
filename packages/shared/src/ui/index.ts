/**
 * packages/shared/src/ui/index.ts
 *
 * shadcn/ui components shared across applications
 */

export { cn } from './utils';

export { Avatar, AvatarImage, AvatarFallback } from './Avatar';
export { Badge, badgeVariants } from './Badge';
export { Button, buttonVariants } from './button';
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './Card';
export { Input } from './Input';
export * from './select';
export * from './popover';
export * from './scroll-area';
export type { InputProps } from './Input';
export { Separator } from './Separator';
export { Skeleton } from './Skeleton';
export { VendorCard } from './VendorCard';
export type { VendorCardProps } from './VendorCard';

// ── Dashboard primitives ────────────────────────────────────────────────────
export { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from './dropdown-menu';
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './table';
export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from './sidebar';
