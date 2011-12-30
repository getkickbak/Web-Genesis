class Constant

   MIN_TIME = Time.parse('0000-01-01 00:00:00')
   MAX_TIME = Time.parse('9999-12-31 11:59:59')
   MIN_DATE = Date.strptime('01/01/0000', '%m/%d/%Y')
   MAX_DATE = Date.strptime('12/31/9999', '%m/%d/%Y')
end