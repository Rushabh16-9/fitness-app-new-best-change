export interface NavItem {
  id: number;
  displayName: string;
  disabled?: boolean;
  iconName: string;
  faIcon: string;
  route?: string;
  children?: NavItem[];
}
