import {
  reactExtension,
  Text,
  useApi,
  useCartLines,
  useSubscription,
  useAppMetafields,
} from '@shopify/ui-extensions-react/checkout';
import { useEffect, useState } from 'react';

export default reactExtension(
  'purchase.checkout.shipping-option-item.render-after',
  () => <Extension />,
);

function Extension() {
  console.log('Extension component rendered');

  const { target, isTargetSelected } = useApi();
  const shippingOption = useSubscription(target);
  const title = shippingOption?.title;
  const cart = useCartLines();
  
  // 提取每个购物车行项目中的商品 ID,以及产品ID。
  const merchandiseIds = cart.map(line => line.merchandise.id);
  console.log('Merchandise IDs:', merchandiseIds);

  const metafields = useAppMetafields({
    key: 'pre_sale_end_date',
    namespace: 'detail',
  });
  console.log('Metafields:', metafields);

  const [maxDateString, setMaxDateString] = useState(null);

  useEffect(() => {
    console.log('useEffect triggered');
    if (metafields.length > 0) {
      let maxDate = metafields.reduce((max, current) => {
        const currentDate = new Date(current.metafield.value);
        if (!isNaN(currentDate.getTime())) { // Check if the date is valid
          if (!max || currentDate > max) {
            max = currentDate;
          }
        }
        return max;
      }, null);

      if (maxDate) {
        const options = { month: 'short', day: 'numeric' };
        const formattedDateString = maxDate.toLocaleDateString('en-US', options);
        console.log('Max Date:', formattedDateString);
        setMaxDateString(formattedDateString);
      } else {
        console.log('No valid max date found');
        setMaxDateString(null);
      }
    } else {
      console.log('No metafields found');
      setMaxDateString(null);
    }
  }, [metafields]);

  const selected = useSubscription(isTargetSelected);

  console.log('Shipping option selected:', selected);
  console.log('Shipping option title:', shippingOption?.title);

  // 条件渲染：仅在运输方式被选中时渲染文本
  if (selected && shippingOption && shippingOption.title.includes('Express') && maxDateString) {
    console.log('Rendering text with maxDateString:', maxDateString);
    return (
      <Text emphasis='bold' size='small'>
        {`Please be informed the order expects to be shipped by ${maxDateString}.`}
      </Text>
    );
  }

  console.log('Conditions not met for rendering text');
  return null; // 或者根据需要返回默认UI
}
