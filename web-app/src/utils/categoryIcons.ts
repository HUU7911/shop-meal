import EmojiFoodBeverageIcon from '@mui/icons-material/EmojiFoodBeverage';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import RamenDiningIcon from '@mui/icons-material/RamenDining';
import RiceBowlIcon from '@mui/icons-material/RiceBowl';
import type { ElementType } from 'react';

// Icon cho các danh mục mà product-service tạo sẵn khi khởi động (CAFE, NOODLE, RICE, MILK_TEA).
const CATEGORY_ICON: Record<string, ElementType> = {
    CAFE: LocalCafeIcon,
    NOODLE: RamenDiningIcon,
    RICE: RiceBowlIcon,
    MILK_TEA: EmojiFoodBeverageIcon,
};

/** Danh mục khác dùng icon mặc định. */
export const getCategoryIcon = (name: string): ElementType => CATEGORY_ICON[name] ?? FastfoodIcon;