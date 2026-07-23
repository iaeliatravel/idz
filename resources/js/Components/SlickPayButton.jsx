import { useState } from 'react';
import axios from 'axios';
import { Link } from '@inertiajs/react';

/**
 * Bouton de paiement Slick-Pay.
 * Redirige directement vers SATIM sans page intermédiaire.
 */
export function SlickPayButton({ applicationId, amount }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  async function handlePay() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(`/api/evisa/pay/${applicationId}`);
      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        throw new Error('URL de paiement non reçue.');
      }
    } catch (e) {
      setError(e.response?.data?.error || "Impossible d'initier le paiement. Merci de réessayer.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={handlePay} disabled={loading}
        className="w-full py-4 rounded-full font-semibold text-white bg-gradient-to-br from-[#00143C] to-[#0F2D5C] hover:shadow-[0_8px_32px_rgba(0,20,60,0.3)] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3">
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Redirection vers SATIM...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Payer {amount ? `${Number(amount).toLocaleString('fr-DZ')} DZD` : ''}
          </>
        )}
      </button>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
        <Badge icon="🔒" text="Paiement sécurisé SATIM" />
        <Badge icon="🏦" text="CIB & EDAHABIA" />
        <Badge icon="⚡" text="via Slick-Pay" />
      </div>

      {error && (
        <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm text-center">{error}</div>
      )}
    </div>
  );
}

function Badge({ icon, text }) {
  return (
    <div className="flex items-center gap-1.5 text-[#8892A4] text-xs">
      <span>{icon}</span><span>{text}</span>
    </div>
  );
}

/**
 * SuccessStep mis à jour — affiche le prix total et le nombre de voyageurs.
 */
export function SuccessStep({ reference, applicationId, amount, nbTravelers = 1 }) {
  return (
    <div className="max-w-[520px] mx-auto text-center py-10 px-4">
      {/* Icône animée */}
      <div className="relative w-20 h-20 mx-auto mb-6">
        <div className="absolute inset-0 rounded-full bg-[#0F6E56]/10 animate-ping" />
        <div className="relative w-20 h-20 rounded-full bg-[#0F6E56]/15 flex items-center justify-center text-[#0F6E56] text-3xl">✓</div>
      </div>

      <h2 className="mb-2">Demande reçue !</h2>
      <p className="text-[#8892A4] mb-4 text-sm">
        Votre dossier pour <strong>{nbTravelers} voyageur{nbTravelers > 1 ? 's' : ''}</strong> a bien été enregistré.
      </p>

      {/* Référence */}
      <div className="inline-block px-8 py-3 rounded-2xl bg-[#00143C] text-[#C9A84C] text-xl font-semibold mb-6 mono tracking-wider shadow-[0_8px_32px_rgba(0,20,60,0.2)]">
        {reference}
      </div>

      {/* Séparateur */}
      <div className="my-5 flex items-center gap-4">
        <div className="flex-1 h-px bg-[#EDE9E0]" />
        <span className="text-[#8892A4] text-sm font-medium">Procédez au paiement</span>
        <div className="flex-1 h-px bg-[#EDE9E0]" />
      </div>

      {/* Bloc paiement */}
      <div className="bg-white rounded-2xl border border-[#EDE9E0] p-5 mb-5 text-left shadow-[var(--shadow-soft)]">
        <h4 className="font-semibold text-[#00143C] mb-1 flex items-center gap-2 text-sm">
          <span className="text-[#C9A84C]">💳</span>
          Paiement en ligne sécurisé
        </h4>
        {nbTravelers > 1 && (
          <p className="text-[#8892A4] text-xs mb-3">
            {nbTravelers} voyageurs — montant total : <strong className="text-[#00143C]">{Number(amount).toLocaleString('fr-DZ')} DZD</strong>
          </p>
        )}
        <p className="text-[#8892A4] text-sm mb-4">
          Réglez par <strong>carte CIB</strong> ou <strong>EDAHABIA</strong>.
        </p>
        <SlickPayButton applicationId={applicationId} amount={amount} />
      </div>

      {/* Alternative agence */}
      <div className="bg-[#F7F5F0] border border-[#EDE9E0] rounded-2xl px-5 py-4 mb-4 text-center">
        <p className="text-[#8892A4] text-sm leading-relaxed">
          💼 <strong className="text-[#00143C]">Vous préférez payer en agence ?</strong><br />
          Nous vous contacterons dans les prochaines heures pour finaliser votre dossier.
        </p>
      </div>

      <Link href="/" className="inline-block text-sm text-[#8892A4] hover:text-[#00143C] transition-colors">
        ← Retour à l'accueil
      </Link>
    </div>
  );
}
