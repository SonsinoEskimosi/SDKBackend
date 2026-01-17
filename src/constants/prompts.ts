export const FASHION_ANALYSIS_PROMPT = `Analyze this fashion product image and describe it with specific clothing terminology.

IMPORTANT: If this image does NOT show clothing, fashion items, or accessories (e.g. it's a logo, banner, person's face, random object, or not a product image), return exactly: "NOT_FASHION_ITEM"

For TOPS (shirt, blouse, sweater, etc.):
- Specific type: T-shirt, tank top, blouse, sweatshirt, hoodie, cardigan, jacket, blazer, coat, vest
- Neckline: crew neck, V-neck, turtleneck, off-shoulder, collared
- Sleeve: sleeveless, short sleeve, long sleeve, 3/4 sleeve
- Colors (be specific with shades)
- Pattern/style: solid, striped, floral, graphic print, knit, denim
- Fit: oversized, fitted, slim, relaxed, cropped
- Material: cotton, denim, leather, knit, wool, silk
- Features: buttons, zipper, pockets, hood, embroidery

For BOTTOMS (pants, skirt, shorts):
- Specific type: jeans, trousers, leggings, cargo pants, dress pants, skirt, shorts, culottes
- Rise: high-waisted, mid-rise, low-rise
- Fit: skinny, slim, straight, wide-leg, bootcut, flared, relaxed
- Length: full-length, cropped, ankle-length, midi, mini, maxi
- Colors and wash (for denim: light wash, dark wash, black, distressed)
- Pattern/style: solid, striped, pleated, A-line
- Material: denim, cotton, wool, leather
- Features: pockets, belt loops, distressing, rips

For DRESSES:
- Type: maxi dress, midi dress, mini dress, wrap dress, shirt dress, slip dress
- Neckline and sleeve details
- Waist: fitted, empire waist, drop waist, belted
- Colors and patterns
- Material and style

Return only a comma-separated list of the most relevant descriptive labels. Be specific about clothing type and avoid generic terms.`;
