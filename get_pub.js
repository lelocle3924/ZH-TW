const fs = require('fs');
const str = "untrusted comment: minisign public key: 4B576F6199278BE2\nRWTiiyeZYW9XSzIsl/lXcr55cjpj9rAD/tdPl1zIcxCY8TxMuCPSZwCF\n";
const b64 = Buffer.from(str, 'utf8').toString('base64');
fs.writeFileSync('pub.txt', b64);
