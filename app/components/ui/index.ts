/**
 * Primitive layer. Pages and feature components import from here and never
 * reach for a third-party component library or raw palette colors directly.
 */

export { default as Button, buttonStyles } from "./Button";
export type { ButtonProps } from "./Button";

export {
  default as Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBody,
  CardFooter,
} from "./Card";

export { default as Badge, ColorBadge } from "./Badge";
export { default as Avatar, AvatarGroup } from "./Avatar";

export { default as Input, Textarea } from "./Input";
export { default as Select } from "./Select";
export type { SelectOption } from "./Select";
export { default as Checkbox } from "./Checkbox";
export { default as Switch } from "./Switch";

export { default as Modal, ModalClose } from "./Modal";
export { default as ConfirmDialog } from "./ConfirmDialog";
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuItemIndicator,
  DropdownMenuGroup,
} from "./DropdownMenu";
export { default as Tooltip, TooltipProvider } from "./Tooltip";
export {
  default as Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
  PopoverAnchor,
} from "./Popover";

export { default as Tabs, TabsList, TabsTrigger, TabsContent } from "./Tabs";
export { default as DataTable } from "./DataTable";
export type { Column } from "./DataTable";
export { default as BulkActionBar } from "./BulkActionBar";
export { default as Pagination } from "./Pagination";

export {
  default as Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonRows,
} from "./Skeleton";
export { default as EmptyState } from "./EmptyState";
export { default as ErrorState, InlineError } from "./ErrorState";
export { default as Spinner } from "./Spinner";

export { ToastProvider, useToast } from "./Toast";
export type { ToastOptions } from "./Toast";

export { default as Kbd } from "./Kbd";
export { default as Separator } from "./Separator";
export { default as ThemeToggle } from "./ThemeToggle";
export { default as AuthMethodBadge } from "./AuthMethodBadge";
