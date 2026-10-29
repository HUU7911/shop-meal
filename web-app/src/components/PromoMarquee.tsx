import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import { Box } from '@mui/material';
import { keyframes } from '@mui/material/styles';

const MESSAGES = [
    'Giao hàng nhanh trong 30 phút',
    'Miễn phí giao hàng cho đơn từ 150.000đ',
    'Đồ ăn nóng hổi, giao tận nơi',
];

const scroll = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
`;

export default function PromoMarquee() {
    const group = [...MESSAGES, ...MESSAGES, ...MESSAGES];

    const renderGroup = (hidden: boolean) => (
        <Box
            aria-hidden={hidden || undefined}
            sx={{ display: 'flex', flexShrink: 0, alignItems: 'center' }}
        >
            {group.map((text, i) => (
                <Box
                    key={i}
                    component="span"
                    sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, pr: { xs: 5, md: 8 }, whiteSpace: 'nowrap' }}
                >
                    <LocalShippingOutlinedIcon sx={{ fontSize: 18, color: 'secondary.main' }} />
                    {text}
                </Box>
            ))}
        </Box>
    );

    return (
        <Box
            role="region"
            aria-label="Thông báo giao hàng"
            sx={{
                bgcolor: 'primary.dark',
                color: '#fff',
                fontSize: { xs: '.82rem', md: '.88rem' },
                fontWeight: 600,
                py: 0.9,
                overflow: 'hidden',
                '@media (prefers-reduced-motion: reduce)': { overflowX: 'auto' },
            }}
        >
            <Box
                className="promo-track"
                sx={{
                    display: 'flex',
                    width: 'max-content',
                    animation: `${scroll} 40s linear infinite`,
                    '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
                }}
            >
                {renderGroup(false)}
                {renderGroup(true)}
            </Box>
        </Box>
    );
}