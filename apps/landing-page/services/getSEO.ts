import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface SEOData {
    title: string;
    description: string;
    keywords: string;
    ogImage: string;
    ogTitle?: string;
    ogDescription?: string;
    dashboardFavicon?: string;
    landingFavicon?: string;
    twitterCard?: "summary" | "summary_large_image";
    twitterHandle?: string;
    canonicalUrl?: string;
    googleSiteVerification?: string;
    author?: string;
}

export const getSEO = async (): Promise<SEOData> => {
    const defaultSEO: SEOData = {
        title: "Bumi Anyom | Kembali Membumi",
        description: "Luxury resort sanctuary in the heart of nature.",
        keywords: "luxury resort, nature sanctuary, bumi anyom, accommodation",
        ogImage: "",
        twitterCard: "summary_large_image",
    };

    try {
        const docRef = doc(db, "settings", "seo");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {
                ...defaultSEO,
                ...docSnap.data(),
            } as SEOData;
        }
    } catch (err) {
        console.error("Error fetching SEO:", err);
    }

    return defaultSEO;
};
