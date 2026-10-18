import { formatPhone } from "./phone";

export const SHOP_PHONE = "+375290000000";
export const SHOP_PHONE_DISPLAY = formatPhone(SHOP_PHONE);
export const SHOP_ADDRESS = "Минск, ул. Короля, 9";

const mapsQuery = encodeURIComponent(SHOP_ADDRESS);
export const MAPS_URL = `https://yandex.by/maps/?text=${mapsQuery}`;
export const ROUTE_URL = `https://yandex.by/maps/?rtext=~${mapsQuery}`;
