import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Vérification de la clé secrète Stripe (important)
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set.');
}

// Initialisation de Stripe avec la clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Fonction handler pour la méthode POST
export async function POST(request: Request) {
  try {
    // 1. Récupérer le corps de la requête au format JSON
    const body = await request.json();

    // 2. Extraire les données en utilisant les clés envoyées par le frontend : 'price' et 'productDescription'
    const { price, productDescription } = body;

    // 3. Validation basique utilisant les clés 'price' et 'productDescription'
    //    Assurez-vous que 'price' est un nombre positif (car il est déjà en centimes)
    if (!price || typeof price !== 'number' || price <= 0) {
      console.error("Validation échouée: 'price' invalide reçu.", price);
      return NextResponse.json(
        {
          error: {
            message:
              'Le prix fourni est invalide (doit être un nombre positif de centimes).',
          },
        },
        { status: 400 }
      );
    }
    // Assurez-vous que 'productDescription' est une chaîne de caractères non vide
    if (
      !productDescription ||
      typeof productDescription !== 'string' ||
      productDescription.trim() === ''
    ) {
      console.error(
        "Validation échouée: 'productDescription' invalide reçue.",
        productDescription
      );
      return NextResponse.json(
        {
          error: { message: 'La description du produit fournie est invalide.' },
        },
        { status: 400 }
      );
    }

    // 4. Déterminer l'URL d'origine pour les redirections success/cancel
    //    Utilise l'en-tête 'origin' si disponible, sinon fallback sur localhost
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // 5. Créer la session de paiement Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], // Méthodes de paiement autorisées
      line_items: [
        {
          price_data: {
            currency: 'eur', // Devise
            product_data: {
              // Utiliser la variable 'productDescription' venant du frontend
              name: productDescription,
            },
            // Utiliser la variable 'price' venant du frontend (supposée être en centimes)
            unit_amount: price,
          },
          quantity: 1, // Quantité fixe à 1 pour cet exemple
        },
      ],
      mode: 'payment', // Mode de paiement unique
      // URL de succès : redirige vers cette page si le paiement réussit
      success_url: `${origin}/reservation-succes?session_id={CHECKOUT_SESSION_ID}`,
      // URL d'annulation : redirige vers cette page si l'utilisateur annule
      cancel_url: `${origin}/`, // Redirige vers la page d'accueil ici
      // Vous pouvez ajouter des métadonnées ici si nécessaire pour lier la session
      // à un utilisateur ou une réservation spécifique dans votre système.
      // metadata: { userId: '...', reservationId: '...' }
    });

    // 6. Vérifier si la session a bien été créée et possède un ID
    if (!session.id) {
      // Cette erreur est peu probable si l'appel à Stripe réussit, mais sécurité
      throw new Error(
        "Échec de la récupération de l'ID de session après création par Stripe."
      );
    }

    // 7. Retourner l'ID de la session au frontend
    console.log(`Session Stripe créée avec succès : ${session.id}`);
    return NextResponse.json({ sessionId: session.id });
  } catch (err: any) {
    // 8. Gérer les erreurs potentielles (validation, appel Stripe, etc.)
    console.error('Erreur lors de la création de la session Stripe:', err);
    // Retourner une erreur 500 générique ou spécifique si possible
    return NextResponse.json(
      {
        error: {
          message:
            err.message ||
            'Erreur interne du serveur lors de la création de la session de paiement.',
        },
      },
      { status: 500 }
    );
  }
}
