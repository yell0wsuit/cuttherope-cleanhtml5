import LangId from "@/resources/LangId";

class DefaultLoc {
    /**
     * Returns the default language ID.
     * @returns {LangId}
     */
    getDefaultLangId(): LangId {
        return LangId.EN;
    }
}

export default new DefaultLoc();
