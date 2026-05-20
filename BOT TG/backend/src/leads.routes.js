import { Router } from 'express';
import { sendOwnerLeadNotification } from './telegram.service.js';

export const leadsRouter = Router();

const required = (value) => String(value || '').trim().length > 0;

const normalizeLead = (body) => {
  const now = new Date();

  return {
    id: `lead_${now.getTime()}`,
    name: String(body.name || '').trim(),
    phone: String(body.phone || '').trim(),
    service: body.service || 'Электромонтаж',
    objectType: body.objectType || body.contactObjectType || body.object || '',
    address: body.address || body.district || '',
    comment: body.comment || body.message || '',
    calculatorData: body.calculatorData || body.calculator || null,
    calculatedPrice: body.calculatedPrice || body.estimatedPrice || null,
    source: body.source || 'сайт',
    sourcePage: body.sourcePage || body.page || '',
    createdAt: now.toISOString(),
    status: 'new',
  };
};

leadsRouter.post('/api/leads', async (req, res) => {
  const lead = normalizeLead(req.body || {});

  if (!required(lead.name) || !required(lead.phone)) {
    return res.status(400).json({
      success: false,
      message: 'name and phone are required',
    });
  }

  try {
    await sendOwnerLeadNotification(lead);

    return res.status(201).json({
      success: true,
      leadId: lead.id,
      status: lead.status,
      telegram: 'sent',
    });
  } catch (error) {
    console.error('[lead.telegram_error]', error);

    return res.status(202).json({
      success: true,
      leadId: lead.id,
      status: lead.status,
      telegram: 'failed',
      warning: 'Lead accepted, but Telegram notification failed',
    });
  }
});
