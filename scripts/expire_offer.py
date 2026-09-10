from datetime import datetime, timezone
from pathlib import Path
import json,re
DEADLINE=datetime(2026,9,27,5,0,tzinfo=timezone.utc)
if datetime.now(timezone.utc)<DEADLINE:
 print('Offer is still active.');raise SystemExit(0)
p=Path('index.html');s=p.read_text(encoding='utf-8')
s=s.replace('data-offer-expired="false"','data-offer-expired="true"')
def expire(m):
 data=json.loads(m.group(1))
 for v in data['hasVariant']:v['offers']['availability']='https://schema.org/OutOfStock'
 return '<script id="product-schema" type="application/ld+json">'+json.dumps(data,ensure_ascii=False)+'</script>'
s=re.sub(r'<script id="product-schema" type="application/ld\+json">(.*?)</script>',expire,s)
s=s.replace('data-offer-label>UNA OPORTUNIDAD PARA MOVERTE','data-offer-label>OFERTA FINALIZADA')
s=s.replace('<strong>S/130.00</strong>','<strong>Agotado</strong>')
s=s.replace('id="offer-status" role="status">Oferta hasta el 26 de septiembre de 2026','id="offer-status" role="status">Agotado · Oferta finalizada')
s=s.replace('data-offer-tag>OFERTA','data-offer-tag>AGOTADO')
p.write_text(s,encoding='utf-8')
print('Expired offer in static HTML and structured data.')
