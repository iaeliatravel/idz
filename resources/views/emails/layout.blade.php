<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  body{font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:0}
  .wrap{max-width:600px;margin:30px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)}
  .header{background:linear-gradient(135deg,#00143C,#3C8CB4);padding:28px 32px;color:#fff}
  .header h1{margin:0;font-size:20px;font-weight:700}
  .header p{margin:4px 0 0;font-size:13px;opacity:.8}
  .body{padding:28px 32px;color:#333;font-size:15px;line-height:1.7}
  .field{margin:8px 0;padding:10px 14px;background:#f8f9fb;border-radius:6px;border-left:4px solid #3C8CB4}
  .field strong{display:block;font-size:11px;text-transform:uppercase;color:#888;margin-bottom:2px}
  .field span{font-size:15px;color:#00143C;font-weight:600}
  .badge{display:inline-block;background:#00143C;color:#fff;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700}
  .footer{background:#f8f9fb;padding:16px 32px;font-size:12px;color:#aaa;text-align:center;border-top:1px solid #eee}
  .btn{display:inline-block;margin-top:16px;padding:12px 24px;background:linear-gradient(135deg,#00143C,#3C8CB4);color:#fff;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px}
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <h1>✈ Aelia Travel</h1>
    <p>{{ $title }}</p>
  </div>
  <div class="body">{!! $slot !!}</div>
  <div class="footer">© {{ date('Y') }} Aelia Travel — Email automatique, ne pas répondre directement.</div>
</div>
</body>
</html>
