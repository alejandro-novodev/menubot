export function buildContactEmail(data: {
  name: string;
  restaurantName: string;
  email: string;
  plan?: string;
  message?: string;
}): string {
  const { name, restaurantName, email, plan, message } = data;
  const date = new Date().toLocaleDateString('es-CL', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const messageRow = message
    ? `<tr>
        <td style="color:#9ca3af;font-size:12px;padding:6px 0;vertical-align:top;width:38%">Mensaje</td>
        <td style="color:#374151;font-size:14px;line-height:1.5">${message}</td>
      </tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:480px;margin:0 auto">

    <!-- Header -->
    <div style="background:#09090b;border-radius:16px 16px 0 0;padding:28px 24px;text-align:center">
      <div style="font-size:36px;margin-bottom:8px">🍜</div>
      <div style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px">
        Menu<span style="color:#a855f7">Bot</span>
      </div>
      <div style="font-size:11px;color:#6b7280;margin-top:4px;letter-spacing:0.5px;text-transform:uppercase">
        por Novodev SPA
      </div>
    </div>

    <!-- Alert badge -->
    <div style="background:#4f1d96;padding:10px 24px;text-align:center">
      <span style="color:#e9d5ff;font-size:12px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase">
        ✦ Nueva solicitud de acceso
      </span>
    </div>

    <!-- Body -->
    <div style="background:#ffffff;padding:28px 24px">
      <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.6">
        Alguien quiere probar <strong>MenuBot</strong> en su restaurante. Aquí están los detalles:
      </p>

      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px 20px;margin-bottom:20px">
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="color:#9ca3af;font-size:12px;padding:6px 0;width:38%;text-transform:uppercase;letter-spacing:0.3px">Nombre</td>
            <td style="color:#111827;font-size:14px;font-weight:600">${name}</td>
          </tr>
          <tr>
            <td style="color:#9ca3af;font-size:12px;padding:6px 0;text-transform:uppercase;letter-spacing:0.3px">Restaurante</td>
            <td style="color:#111827;font-size:14px;font-weight:600">${restaurantName}</td>
          </tr>
          <tr>
            <td style="color:#9ca3af;font-size:12px;padding:6px 0;text-transform:uppercase;letter-spacing:0.3px">Email</td>
            <td style="font-size:14px"><a href="mailto:${email}" style="color:#9333ea;text-decoration:none;font-weight:500">${email}</a></td>
          </tr>
          <tr>
            <td style="color:#9ca3af;font-size:12px;padding:6px 0;text-transform:uppercase;letter-spacing:0.3px">Plan</td>
            <td style="font-size:14px">
              ${plan
                ? `<span style="background:#f3e8ff;color:#7e22ce;font-size:12px;font-weight:600;padding:2px 10px;border-radius:20px">${plan}</span>`
                : '<span style="color:#9ca3af">Sin preferencia</span>'}
            </td>
          </tr>
          ${messageRow}
        </table>
      </div>

      <a href="mailto:${email}?subject=Re: Tu solicitud de acceso a MenuBot"
         style="display:block;background:#9333ea;color:#ffffff;text-align:center;padding:12px 24px;border-radius:10px;font-weight:600;font-size:14px;text-decoration:none">
        Responder a ${name} →
      </a>
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb;border-radius:0 0 16px 16px;border:1px solid #e5e7eb;border-top:none;padding:16px 24px;text-align:center">
      <p style="margin:0;color:#9ca3af;font-size:12px">
        MenuBot &nbsp;·&nbsp; Novodev SPA &nbsp;·&nbsp; ${date}
      </p>
    </div>

  </div>
</body>
</html>`;
}
