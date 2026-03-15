import base64
text = b"untrusted comment: minisign public key: 4B576F6199278BE2\nRWTiiyeZYW9XSzIsl/lXcr55cjpj9rAD/tdPl1zIcxCY8TxMuCPSZwCF\n"
encoded = base64.b64encode(text).decode('utf-8')
with open("pub.txt", "w") as f:
    f.write(encoded)
