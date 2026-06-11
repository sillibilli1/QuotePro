-- Update existing quotes to inherit currency from user profile
UPDATE quotes q
SET 
    currency = COALESCE(p.currency_code, 'AED'),
    tax_rate = CASE 
        WHEN p.currency_code = 'SAR' THEN 15
        WHEN p.currency_code = 'PKR' THEN 18
        WHEN p.currency_code = 'GBP' THEN 20
        WHEN p.currency_code = 'USD' THEN 0
        ELSE 5
    END
FROM profiles p
WHERE q.user_id = p.id
  AND q.currency = 'AED'  -- Only update quotes that still have the default
  AND q.tax_rate = 5;     -- Only update quotes that still have the default tax rate
