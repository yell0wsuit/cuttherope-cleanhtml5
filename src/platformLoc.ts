import LangId from "@/resources/LangId";

class DefaultLoc {
    /**
     * Returns the default language ID.
     */
    getDefaultLangId(): number {
        return LangId.EN;
    }
}

export default new DefaultLoc();
