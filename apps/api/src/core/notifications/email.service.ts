import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  async send(to: string, subject: string, html: string): Promise<boolean> {
    console.log(`[EMAIL] To: ${to} | Subject: ${subject}`);
    console.log(`[EMAIL] Body: ${html.substring(0, 200)}...`);
    return true;
  }

  async sendCollectionEmail(clientName: string, clientEmail: string, invoiceNumber: string, amount: number, dueDate: string): Promise<boolean> {
    return this.send(
      clientEmail,
      `Recordatorio de pago - Factura ${invoiceNumber}`,
      `<h2>Estimado(a) ${clientName}</h2>
       <p>Le recordamos que la factura <strong>${invoiceNumber}</strong> por <strong>$${amount.toLocaleString()}</strong> 
       con vencimiento el <strong>${dueDate}</strong> se encuentra pendiente de pago.</p>
       <p>Por favor, realice el pago a la brevedad para evitar interrupciones en el servicio.</p>
       <p>Saludos,<br/>Equipo La Vitamina</p>`,
    );
  }

  async sendUdBudgetAlert(clientName: string, clientEmail: string, used: number, total: number): Promise<boolean> {
    const pct = Math.round((used / total) * 100);
    return this.send(
      clientEmail,
      `Alerta de presupuesto UD - ${clientName}`,
      `<h2>Estimado(a) ${clientName}</h2>
       <p>Le informamos que ha utilizado el <strong>${pct}%</strong> de su presupuesto de diseño mensual 
       ($${used.toLocaleString()} de $${total.toLocaleString()} UD contratadas).</p>
       ${pct >= 100 ? '<p><strong>Su presupuesto se ha agotado.</strong> Las nuevas solicitudes quedarán en espera hasta el próximo ciclo.</p>' : '<p>Le recomendamos planificar las solicitudes restantes del mes.</p>'}
       <p>Saludos,<br/>Equipo La Vitamina</p>`,
    );
  }

  async sendPieceStuckAlert(designerEmail: string, pieceTitle: string, hoursStuck: number): Promise<boolean> {
    return this.send(
      designerEmail,
      `Alerta: Pieza estancada - ${pieceTitle}`,
      `<h2>Alerta de producción</h2>
       <p>La pieza <strong>${pieceTitle}</strong> lleva <strong>${Math.round(hoursStuck)} horas</strong> sin movimiento.</p>
       <p>Por favor, revise y actualice el estado de esta pieza a la brevedad.</p>`,
    );
  }
}
