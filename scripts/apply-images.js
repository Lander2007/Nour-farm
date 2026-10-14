const fs = require('fs');

const mapping = {
  // 1. WA0065 - حلقات بصل أحمر
  'sliced-red-onion-rings-250g': '/noor-farm-images/IMG-20261014-WA0065.jpg',

  // 2. WA0066 - بصل أبيض حلقات
  'sliced-white-onion-rings-250g': '/noor-farm-images/IMG-20261014-WA0066.jpg',

  // 3. WA0068 - طبق فلفل ألوان صوابع فاهيتا
  'fajita-color-pepper-strips-250g': '/noor-farm-images/IMG-20261014-WA0068.jpg',

  // 4. WA0069 - نعناع بلدي
  'mint-bunch': '/noor-farm-images/IMG-20261014-WA0069.jpg',

  // 5. WA0070 - زعتر وروزماري
  'fresh-thyme': '/noor-farm-images/IMG-20261014-WA0070.jpg',
  'rosemary': '/noor-farm-images/IMG-20261014-WA0070.jpg',

  // 6. WA0071 - خضار سوتيه / فلفل حلقات
  'saute-veg-mix-250g': '/noor-farm-images/IMG-20261014-WA0071.jpg',

  // 7. WA0074 - فلفل مقور للحشو
  'stuffing-green-pepper': '/noor-farm-images/IMG-20261014-WA0074.jpg',

  // 8. WA0077 - فلفل ألوان شرائح
  'colored-peppers': '/noor-farm-images/IMG-20261014-WA0077.jpg',
  'tourli-veg-mix-500g': '/noor-farm-images/IMG-20261014-WA0077.jpg',

  // 9. WA0078 - فلفل أخضر صوابع فاهيتا
  'sliced-green-pepper-strips-250g': '/noor-farm-images/IMG-20261014-WA0078.jpg',

  // 10. WA0079 - فلفل مكعبات
  'diced-color-pepper-250g': '/noor-farm-images/IMG-20261014-WA0079.jpg',
  'diced-green-pepper-250g': '/noor-farm-images/IMG-20261014-WA0079.jpg',
  'red-bean-corn-pomegranate-salad-150g': '/noor-farm-images/IMG-20261014-WA0079.jpg',

  // 11. WA0080 - بطاطس حلقات صواني
  'sliced-potato-rounds-250g': '/noor-farm-images/IMG-20261014-WA0080.jpg',

  // 12. WA0081 - بصل متقور للحشو
  'cored-onions-250g': '/noor-farm-images/IMG-20261014-WA0081.jpg',

  // 13. WA0082 - سلطة خضراء مكعبات بلدي
  'classic-diced-green-salad-250g': '/noor-farm-images/IMG-20261014-WA0082.jpg',

  // 14. WA0083 - سلق فلاحي للقلقاس
  'chard': '/noor-farm-images/IMG-20261014-WA0083.jpg',

  // 15. WA0084 - كرفس بلدي فلاحي
  'local-celery': '/noor-farm-images/IMG-20261014-WA0084.jpg',

  // 16. WA0085 - كرفس فرنساوي
  'french-celery': '/noor-farm-images/IMG-20261014-WA0085.jpg',

  // 17. WA0086 - كزبرة خضراء فلاحي
  'coriander': '/noor-farm-images/IMG-20261014-WA0086.jpg',

  // 18. WA0087 - بقدونس بلدي منقى
  'parsley': '/noor-farm-images/IMG-20261014-WA0087.jpg',

  // 19. WA0088 - سبانخ بلدي خضراء
  'fresh-spinach': '/noor-farm-images/IMG-20261014-WA0088.jpg',

  // 20. WA0089 - شبت بلدي طازج
  'dill': '/noor-farm-images/IMG-20261014-WA0089.jpg',

  // 21. WA0090 - زنجبيل طازج
  'fresh-ginger': '/noor-farm-images/IMG-20261014-WA0090.jpg',

  // 22. WA0091 - ذرة صفراء كيزان وحلقات
  'sweet-corn-cobs': '/noor-farm-images/IMG-20261014-WA0091.jpg',
  'cut-sweet-corn-500g': '/noor-farm-images/IMG-20261014-WA0091.jpg',

  // 23. WA0092 - ثوم بلدي
  'garlic': '/noor-farm-images/IMG-20261014-WA0092.jpg',
  'peeled-garlic-cloves-250g': '/noor-farm-images/IMG-20261014-WA0092.jpg',

  // 24. WA0093 - كوسة بلدي
  'zucchini': '/noor-farm-images/IMG-20261014-WA0093.jpg',
  'cored-zucchini-500g': '/noor-farm-images/IMG-20261014-WA0093.jpg',
  'cubed-zucchini-250g': '/noor-farm-images/IMG-20261014-WA0093.jpg',
  'sliced-zucchini-rounds-250g': '/noor-farm-images/IMG-20261014-WA0093.jpg',
  'zucchini-sticks-250g': '/noor-farm-images/IMG-20261014-WA0093.jpg',

  // 25. WA0094 - بطاطس تحمير رملية وصوابع ومكعبات
  'frying-potatoes': '/noor-farm-images/IMG-20261014-WA0094.jpg',
  'french-fry-potato-sticks-500g': '/noor-farm-images/IMG-20261014-WA0094.jpg',
  'cubed-potatoes-250g': '/noor-farm-images/IMG-20261014-WA0094.jpg',
  'cored-potatoes-500g': '/noor-farm-images/IMG-20261014-WA0094.jpg',

  // 26. WA0095 - فلفل أخضر رومي
  'green-pepper-godin': '/noor-farm-images/IMG-20261014-WA0095.jpg',

  // 27. WA0096 - باذنجان أسود عروس
  'black-eggplant': '/noor-farm-images/IMG-20261014-WA0096.jpg',
  'cored-black-eggplant-500g': '/noor-farm-images/IMG-20261014-WA0096.jpg',

  // 28. WA0097 - خرشوف بلدي طازج
  'fresh-artichoke': '/noor-farm-images/IMG-20261014-WA0097.jpg',

  // 29. WA0098 - ليمون بلدي عصير فريش
  'local-lemon': '/noor-farm-images/IMG-20261014-WA0098.jpg',

  // 30. WA0099 - طماطم شيري سكري
  'cherry-tomato': '/noor-farm-images/IMG-20261014-WA0099.jpg',
  'cherry-tomato-arugula-corn-salad-150g': '/noor-farm-images/IMG-20261014-WA0099.jpg',

  // 31. WA0100 - طماطم متقورة للحشو
  'cored-tomatoes-250g': '/noor-farm-images/IMG-20261014-WA0100.jpg',

  // 32. WA0101 - قلقاس بلدي شتوي ومكعبات
  'taro-root': '/noor-farm-images/IMG-20261014-WA0101.jpg',
  'prepped-taro-chard-500g': '/noor-farm-images/IMG-20261014-WA0101.jpg',

  // 33. WA0102 - جرجير بلدي
  'arugula-bunch': '/noor-farm-images/IMG-20261014-WA0102.jpg',
  'arugula-pomegranate-avocado-salad-150g': '/noor-farm-images/IMG-20261014-WA0102.jpg',

  // 34. WA0103 - كابوتشا آيسبرج
  'iceberg-lettuce': '/noor-farm-images/IMG-20261014-WA0103.jpg',
  'shredded-iceberg-250g': '/noor-farm-images/IMG-20261014-WA0103.jpg',
  'coleslaw-150g': '/noor-farm-images/IMG-20261014-WA0103.jpg',

  // 35. WA0104 - بصل أحمر فاير بلدي
  'red-onion': '/noor-farm-images/IMG-20261014-WA0104.jpg',

  // 36. WA0105 - كرنب أحمر سلطات
  'red-cabbage': '/noor-farm-images/IMG-20261014-WA0105.jpg',
  'shredded-red-cabbage-250g': '/noor-farm-images/IMG-20261014-WA0105.jpg',

  // 37. WA0106 - بطاطا سكرية عسلية
  'sweet-potato': '/noor-farm-images/IMG-20261014-WA0106.jpg',

  // 38. WA0107 - بصل أبيض فاير حلو
  'white-onion': '/noor-farm-images/IMG-20261014-WA0107.jpg',

  // 39. WA0108 - كرنب حشو ومسلوق
  'cabbage-stuffing': '/noor-farm-images/IMG-20261014-WA0108.jpg',
  'boiled-cabbage-leaves-500g': '/noor-farm-images/IMG-20261014-WA0108.jpg',
  'shredded-green-cabbage-250g': '/noor-farm-images/IMG-20261014-WA0108.jpg',

  // 40. WA0109 - فلفل ألوان أحمر
  'bell-pepper': '/noor-farm-images/IMG-20261014-WA0109.jpg',

  // 41. WA0110 - ليمون إيطالي كبير وحلقات
  'italian-lemon': '/noor-farm-images/IMG-20261014-WA0110.jpg',
  'sliced-lemon-rounds-150g': '/noor-farm-images/IMG-20261014-WA0110.jpg',

  // 42. WA0111 - كرات وبصل أخضر
  'leek': '/noor-farm-images/IMG-20261014-WA0111.jpg',
  'green-onions-bunch': '/noor-farm-images/IMG-20261014-WA0111.jpg',

  // 43. WA0112 - قرنبيط بلدي طازج وفصوص ومسلوق
  'cauliflower': '/noor-farm-images/IMG-20261014-WA0112.jpg',
  'cut-cauliflower-florets-500g': '/noor-farm-images/IMG-20261014-WA0112.jpg',
  'boiled-cauliflower-500g': '/noor-farm-images/IMG-20261014-WA0112.jpg',

  // 44. WA0113 - بروكلي أخضر طازج
  'fresh-broccoli': '/noor-farm-images/IMG-20261014-WA0113.jpg',
  'boiled-broccoli-250g': '/noor-farm-images/IMG-20261014-WA0113.jpg',

  // 45. WA0114 - طماطم بلدي
  'tomato': '/noor-farm-images/IMG-20261014-WA0114.jpg',

  // 46. WA0115 - طماطم حلقات ومقطعة للطبيخ
  'chopped-cooking-tomatoes-500g': '/noor-farm-images/IMG-20261014-WA0115.jpg',
  'sliced-tomato-salad-150g': '/noor-farm-images/IMG-20261014-WA0115.jpg',

  // 47. WA0116 - فاصوليا خضراء فرنسية
  'green-beans': '/noor-farm-images/IMG-20261014-WA0116.jpg',
  'chopped-green-beans-500g': '/noor-farm-images/IMG-20261014-WA0116.jpg',

  // 48. WA0117 - مشروم طازج أبيض فاخر
  'mushroom': '/noor-farm-images/IMG-20261014-WA0117.jpg',

  // 49. WA0118 - سلطة خضراء حلقات وصوابع
  'green-salad-rounds-250g': '/noor-farm-images/IMG-20261014-WA0118.jpg',
  'green-salad-fingers-250g': '/noor-farm-images/IMG-20261014-WA0118.jpg',
  'veggie-soup-mix-500g': '/noor-farm-images/IMG-20261014-WA0118.jpg',

  // 50. WA0119 - بطاطس إسبونتا للطبخ
  'spunta-potatoes': '/noor-farm-images/IMG-20261014-WA0119.jpg',

  // 51. WA0120 - بنجر أحمر سكري
  'beetroot': '/noor-farm-images/IMG-20261014-WA0120.jpg',

  // 52. WA0121 - قرع عسل مكعبات
  'pumpkin': '/noor-farm-images/IMG-20261014-WA0121.jpg',
  'cubed-pumpkin-500g': '/noor-farm-images/IMG-20261014-WA0121.jpg',

  // 53. WA0122 - جزر أصفر وصوابع ومكعبات
  'carrot': '/noor-farm-images/IMG-20261014-WA0122.jpg',
  'carrots': '/noor-farm-images/IMG-20261014-WA0122.jpg',
  'cubed-carrots-250g': '/noor-farm-images/IMG-20261014-WA0122.jpg',
  'sliced-carrots-rounds-250g': '/noor-farm-images/IMG-20261014-WA0122.jpg',
  'carrot-sticks-250g': '/noor-farm-images/IMG-20261014-WA0122.jpg',
  'carrot-sticks-snack-150g': '/noor-farm-images/IMG-20261014-WA0122.jpg',

  // 54. WA0123 - ليمون أضاليا بلدي
  'adalia-lemon': '/noor-farm-images/IMG-20261014-WA0123.jpg',

  // 55. WA0124 - فلفل حار شطة بلدي
  'hot-chili': '/noor-farm-images/IMG-20261014-WA0124.jpg',

  // 56. WA0125 - فجل أحمر بلدي مقرمش
  'red-radish': '/noor-farm-images/IMG-20261014-WA0125.jpg',

  // 57. WA0126 - ملوخية فلاحي ورق ومتخرطة
  'fresh-molokhia': '/noor-farm-images/IMG-20261014-WA0126.jpg',
  'minced-molokhia-500g': '/noor-farm-images/IMG-20261014-WA0126.jpg',

  // 58. WA0127 - باذنجان رومي كبير للمسقعة
  'roomi-eggplant': '/noor-farm-images/IMG-20261014-WA0127.jpg',

  // 59. WA0128 - بامية تركي صغيرة ناعمة
  'turkish-okra': '/noor-farm-images/IMG-20261014-WA0128.jpg',

  // 60. WA0129 - باذنجان أبيض عروس
  'white-eggplant': '/noor-farm-images/IMG-20261014-WA0129.jpg',
  'cored-white-eggplant-500g': '/noor-farm-images/IMG-20261014-WA0129.jpg',

  // 61. WA0130 - سبانخ بيبي أورجانيك ومغسولة
  'baby-spinach': '/noor-farm-images/IMG-20261014-WA0130.jpg',
  'washed-baby-spinach-500g': '/noor-farm-images/IMG-20261014-WA0130.jpg',

  // 62. WA0131 - خس بلدي وكوري
  'green-lettuce': '/noor-farm-images/IMG-20261014-WA0131.jpg',
  'korean-lettuce': '/noor-farm-images/IMG-20261014-WA0131.jpg',
  'red-lettuce': '/noor-farm-images/IMG-20261014-WA0131.jpg',

  // 63. WA0132 - بامية فلاحي خضراء ومقمعة جاهزة
  'local-okra': '/noor-farm-images/IMG-20261014-WA0132.jpg',
  'prepped-okra-400g': '/noor-farm-images/IMG-20261014-WA0132.jpg',

  // 64. WA0133 - خيار بلدي مقرمش وصوابع
  'cucumber': '/noor-farm-images/IMG-20261014-WA0133.jpg',
  'crisp-cucumber': '/noor-farm-images/IMG-20261014-WA0133.jpg',
  'cucumber-sticks-150g': '/noor-farm-images/IMG-20261014-WA0133.jpg',
  'carrot-cucumber-snack-mix-150g': '/noor-farm-images/IMG-20261014-WA0133.jpg',
};

// Also read data/products.ts and replace the image URLs for each mapped product
let file = fs.readFileSync('data/products.ts', 'utf8');

let updatedCount = 0;
for (const [id, newImg] of Object.entries(mapping)) {
  // Regex to match the product block for this id
  const blockRegex = new RegExp(`(id:\\s*["']${id}["'][\\s\\S]*?image:\\s*)(["'][^"']+["'])`, 'g');
  if (blockRegex.test(file)) {
    file = file.replace(blockRegex, `$1"${newImg}"`);
    updatedCount++;
  } else {
    console.warn(`Could not find product with id: ${id}`);
  }
}

fs.writeFileSync('data/products.ts', file, 'utf8');
console.log(`Successfully mapped and updated ${updatedCount} products in data/products.ts!`);
