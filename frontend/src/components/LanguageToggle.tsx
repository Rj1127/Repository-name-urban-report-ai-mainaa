import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";

export function LanguageToggle() {
    const [lang, setLang] = useState('en');

    useEffect(() => {
        // Read initial language from cookies if Google Translate set it
        const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
        if (match) {
            setLang(match[1]);
        }
    }, []);

    const changeLanguage = (languageCode: string) => {
        setLang(languageCode);
        const selectField = document.querySelector(".goog-te-combo") as HTMLSelectElement;

        if (selectField) {
            selectField.value = languageCode;
            selectField.dispatchEvent(new Event("change"));
        } else {
            // Fallback if widget is slow to load
            console.log("Google Translate widget not ready yet.");
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center gap-2">
                    <Globe className="h-[1.1rem] w-[1.1rem]" />
                    <span className="font-semibold">{lang === 'hi' ? 'हिंदी' : 'English'}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => changeLanguage('en')} className={lang === 'en' ? 'bg-primary/10 font-bold' : ''}>
                    English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('hi')} className={lang === 'hi' ? 'bg-primary/10 font-bold' : ''}>
                    हिंदी (Hindi)
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
