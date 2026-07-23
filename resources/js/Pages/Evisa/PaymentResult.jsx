import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';
import MainLayout from '../../Layouts/MainLayout';

/**
 * Page de retour après paiement SATIM via Slick-Pay.
 * Reçoit les props depuis EvisaPaymentController::result().
 *
 * Props :
 *  - status    : "paid" | "failed" | "canceled" | "pending" | "unknown"
 *  - reference : référence de la demande (ex: EV-2026-516896)
 *  - amount    : montant en DZD
 */
export default function PaymentResult({ status, reference, amount }) {
  const isPaid     = status === 'paid';
  const isFailed   = status === 'failed';
  const isCanceled = status === 'canceled';
  const isPending  = status === 'pending' || status === 'unknown';

  return (
    <MainLayout alwaysSolid>
      <Head title={isPaid ? 'Paiement confirmé — Aelia Travel' : 'Résultat paiement — Aelia Travel'} />

      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center px-4 pt-28 pb-16">
        <div className="bg-white rounded-[28px] max-w-[520px] w-full shadow-[var(--shadow-card)] border border-[#EDE9E0] overflow-hidden">

          {/* Barre colorée en haut */}
          <div className={`h-2 w-full ${
            isPaid     ? 'bg-gradient-to-r from-[#0F6E56] to-[#17A882]'
            : isFailed || isCanceled ? 'bg-gradient-to-r from-red-500 to-red-400'
            : 'bg-gradient-to-r from-[#C9A84C] to-[#E0C97A]'
          }`} />

          <div className="p-10 text-center">
            {/* Icône */}
            <div className="relative w-20 h-20 mx-auto mb-6">
              {isPaid && (
                <>
                  <div className="absolute inset-0 rounded-full bg-[#0F6E56]/10 animate-ping" />
                  <div className="relative w-20 h-20 rounded-full bg-[#0F6E56]/15 flex items-center justify-center text-[#0F6E56] text-3xl">✓</div>
                </>
              )}
              {(isFailed || isCanceled) && (
                <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center text-red-500 text-3xl">✕</div>
              )}
              {isPending && (
                <div className="w-20 h-20 rounded-full bg-[#C9A84C]/10 flex items-center justify-center text-3xl">⏳</div>
              )}
            </div>

            {/* Titre */}
            <h2 className={`mb-3 ${
              isPaid ? 'text-[#0F6E56]'
              : isFailed || isCanceled ? 'text-red-600'
              : 'text-[#C9A84C]'
            }`}>
              {isPaid     && 'Paiement confirmé !'}
              {isFailed   && 'Paiement échoué'}
              {isCanceled && 'Paiement annulé'}
              {isPending  && 'Paiement en attente'}
            </h2>

            {/* Description */}
            <p className="text-[#8892A4] mb-6 leading-relaxed">
              {isPaid     && 'Votre paiement a bien été reçu via CIB/EDAHABIA. Votre dossier eVisa est en cours de traitement. Un email de confirmation vous a été envoyé.'}
              {isFailed   && "Votre paiement n'a pas pu être complété. Votre dossier est conservé — vous pouvez réessayer à tout moment."}
              {isCanceled && 'Vous avez annulé le paiement. Votre dossier est conservé — vous pouvez réessayer à tout moment.'}
              {isPending  && 'Votre paiement est en cours de vérification. Cela peut prendre quelques minutes. Vous recevrez un email de confirmation.'}
            </p>

            {/* Détails paiement */}
            {(isPaid || isPending) && (reference || amount) && (
              <div className="bg-[#F7F5F0] rounded-2xl p-5 mb-6 text-left space-y-3">
                {reference && (
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[#8892A4]">Référence dossier</div>
                    <div className="font-bold text-[#00143C] mono">{reference}</div>
                  </div>
                )}
                {amount && (
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[#8892A4]">Montant payé</div>
                    <div className="font-bold text-[#00143C] mono">{Number(amount).toLocaleString('fr-DZ')} DZD</div>
                  </div>
                )}
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[#8892A4]">Mode de paiement</div>
                  <div className="text-sm text-[#1A1A2E]">CIB / EDAHABIA — SATIM via Slick-Pay</div>
                </div>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex flex-col gap-3">
              {isPaid && (
                <Link
                  href="/"
                  className="w-full py-4 rounded-full font-semibold text-white bg-gradient-to-br from-[#0F6E56] to-[#17A882] hover:shadow-[0_8px_32px_rgba(15,110,86,0.3)] transition-all duration-300 text-center block"
                >
                  Retour à l'accueil
                </Link>
              )}

              {(isFailed || isCanceled) && (
                <>
                  <RetryButton reference={reference} />
                  <Link
                    href="/"
                    className="w-full py-3 rounded-full font-semibold text-[#8892A4] bg-[#F7F5F0] hover:bg-[#EDE9E0] transition-colors text-center block"
                  >
                    Retour à l'accueil
                  </Link>
                </>
              )}

              {isPending && (
                <Link
                  href="/"
                  className="w-full py-4 rounded-full font-semibold text-white bg-gradient-to-br from-[#00143C] to-[#0F2D5C] text-center block"
                >
                  Retour à l'accueil
                </Link>
              )}
            </div>

            {/* Note de réassurance */}
            {isPaid && reference && (
              <p className="mt-6 text-xs text-[#8892A4]">
                Conservez votre référence <strong className="mono">{reference}</strong> pour tout suivi de votre dossier.
              </p>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

/**
 * Bouton "Réessayer" — relance le paiement pour la même demande.
 */
function RetryButton({ reference }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  async function retry() {
    if (!reference) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(`/api/evisa/pay-by-ref/${reference}`);
      if (data.payment_url) {
        window.location.href = data.payment_url;
      }
    } catch (e) {
      setError('Impossible de relancer le paiement. Contactez notre équipe.');
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={retry}
        disabled={loading}
        className="w-full py-4 rounded-full font-semibold text-[#00143C] bg-gradient-to-br from-[#C9A84C] to-[#E0C97A] hover:shadow-[0_0_32px_rgba(201,168,76,0.5)] transition-all duration-300 disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-[#00143C]/30 border-t-[#00143C] rounded-full animate-spin" />
            Redirection...
          </span>
        ) : 'Réessayer le paiement'}
      </button>
      {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}
    </div>
  );
}
