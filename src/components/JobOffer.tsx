import { useMemo } from 'react';
import {
  MapPin,
  Briefcase,
  Mail,
  User,
  CalendarDays,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { JobOfferRecord } from '@/hooks/useJobOffers';
import { format, isValid, parse } from 'date-fns';
import { fr } from 'date-fns/locale';

type SectionKey = 'resume' | 'mission' | 'profil' | 'avantages' | 'remuneration';

interface JobOfferProps {
  offer: JobOfferRecord;
}

interface JobInfoItem {
  icon: LucideIcon;
  primary: string;
  secondary?: string;
  isEmail?: boolean;
  colorClass?: string;
}

interface ParsedSections {
  resumeHtml: string;
  missionHtml: string;
  profilHtml: string;
  avantagesHtml: string;
  remunerationHtml: string;
}

const SECTION_KEYWORDS: Record<SectionKey, string[]> = {
  resume: ['résumé', 'resume', 'présentation', 'presentation', 'description'],
  mission: ['mission', 'missions'],
  profil: ['profil', 'profil recherché', 'profile'],
  avantages: ['avantage', 'avantages'],
  remuneration: ['rémunération', 'remuneration', 'salaire'],
};

const DATE_FORMATS = ['yyyy-MM-dd', 'dd/MM/yyyy', 'dd-MM-yyyy', 'dd.MM.yyyy', 'MM/dd/yyyy'];

function normalizeString(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function parseDate(value?: string): Date | null {
  const normalized = normalizeString(value);
  if (!normalized) {
    return null;
  }

  const direct = new Date(normalized);
  if (isValid(direct)) {
    return direct;
  }

  for (const pattern of DATE_FORMATS) {
    const parsed = parse(normalized, pattern, new Date());
    if (isValid(parsed)) {
      return parsed;
    }
  }

  return null;
}

function formatDate(value?: string): string | undefined {
  const parsed = parseDate(value);
  if (!parsed) {
    return normalizeString(value);
  }

  return format(parsed, 'dd/MM/yyyy', { locale: fr });
}

function detectSectionKey(text: string): SectionKey | null {
  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\s+/g, ' ')
    .replace(/[:\s]+$/g, '')
    .replace(/[\u0300-\u036f]/g, '');

  for (const [key, keywords] of Object.entries(SECTION_KEYWORDS)) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return key as SectionKey;
    }
  }

  return null;
}

function isLikelyHeading(element: Element): boolean {
  if (/^H[1-6]$/.test(element.tagName)) {
    return true;
  }

  if (element.tagName === 'P') {
    if (element.querySelector('strong, b, u')) {
      return true;
    }
    const text = element.textContent ?? '';
    const trimmed = text.trim();
    if (trimmed.length > 0 && trimmed.length <= 80 && trimmed === trimmed.toUpperCase()) {
      return true;
    }
  }

  return false;
}

function parseJobOfferSections(html?: string): ParsedSections {
  const empty: ParsedSections = {
    resumeHtml: '',
    missionHtml: '',
    profilHtml: '',
    avantagesHtml: '',
    remunerationHtml: '',
  };

  if (!html) {
    return empty;
  }

  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return empty;
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const sections: Record<SectionKey, string[]> = {
      resume: [],
      mission: [],
      profil: [],
      avantages: [],
      remuneration: [],
    };

    let current: SectionKey = 'resume';

    doc.body.childNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const textContent = element.textContent?.trim() ?? '';
        if (!textContent) {
          return;
        }

        const sectionKey = detectSectionKey(textContent);
        if (sectionKey && (isLikelyHeading(element) || textContent.length <= 80)) {
          current = sectionKey;
          return;
        }

        sections[current].push(element.outerHTML);
        return;
      }

      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) {
          sections[current].push(`<p>${text}</p>`);
        }
      }
    });

    return {
      resumeHtml: sections.resume.join('').trim(),
      missionHtml: sections.mission.join('').trim(),
      profilHtml: sections.profil.join('').trim(),
      avantagesHtml: sections.avantages.join('').trim(),
      remunerationHtml: sections.remuneration.join('').trim(),
    };
  } catch (error) {
    console.warn("Impossible de parser le contenu de l'offre :", error);
    return empty;
  }
}

function combineHtml(...parts: Array<string | undefined>): string {
  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part && part.length))
    .join('');
}

function renderHtmlContent(content?: string) {
  if (!content || !content.trim()) {
    return (
      <p className="text-base text-muted-foreground">Pas d'informations pour le moment</p>
    );
  }

  return (
    <div
      className="space-y-2 text-base leading-relaxed [&>p]:m-0 [&>ul]:list-disc [&>ul]:pl-6 [&>ol]:list-decimal [&>ol]:pl-6"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

export function JobOffer({ offer }: JobOfferProps) {
  const publishedLabel = useMemo(() => formatDate(offer.publishedAt), [offer.publishedAt]);

  const infoItems = useMemo<JobInfoItem[]>(() => {
    const items: JobInfoItem[] = [];
    if (offer.location) {
      items.push({ icon: MapPin, primary: offer.location, colorClass: 'text-[var(--glenat-livre)]' });
    }
    if (offer.contractType) {
      items.push({
        icon: Briefcase,
        primary: offer.contractType,
        colorClass: 'text-[var(--glenat-jeunesse)]',
      });
    }
    if (offer.contactName) {
      items.push({ icon: User, primary: 'Contact', secondary: offer.contactName, colorClass: 'text-primary' });
    }
    if (offer.contactEmail) {
      items.push({
        icon: Mail,
        primary: 'Email',
        secondary: offer.contactEmail,
        isEmail: true,
        colorClass: 'text-primary',
      });
    }
    if (publishedLabel) {
      items.push({
        icon: CalendarDays,
        primary: 'Annonce du :',
        secondary: publishedLabel,
        colorClass: 'text-[var(--glenat-manga)]',
      });
    }
    return items;
  }, [offer.location, offer.contractType, offer.contactName, offer.contactEmail, publishedLabel]);

  const sections = useMemo(() => {
    const parsed = parseJobOfferSections(offer.descriptionHtml);

    const resumeHtml = offer.resumeHtml ?? parsed.resumeHtml;
    const missionHtml = offer.missionHtml ?? parsed.missionHtml;
    const profilHtml = offer.profilHtml ?? parsed.profilHtml;
    const remunerationHtml = offer.remunerationHtml ?? parsed.remunerationHtml;
    const avantagesHtml = combineHtml(offer.advantagesHtml ?? parsed.avantagesHtml, remunerationHtml);

    return { resumeHtml, missionHtml, profilHtml, avantagesHtml };
  }, [
    offer.descriptionHtml,
    offer.resumeHtml,
    offer.missionHtml,
    offer.profilHtml,
    offer.advantagesHtml,
    offer.remunerationHtml,
  ]);

  const defaultTab = useMemo(() => {
    if (sections.resumeHtml?.trim()) {
      return 'resume';
    }
    if (sections.missionHtml?.trim()) {
      return 'mission';
    }
    if (sections.profilHtml?.trim()) {
      return 'profil';
    }
    if (sections.avantagesHtml?.trim()) {
      return 'avantages';
    }
    return 'resume';
  }, [sections]);

  const showSubtitle = offer.subtitle && offer.subtitle !== offer.title;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-bold">{offer.title}</CardTitle>
        {showSubtitle ? (
          <p className="text-base text-muted-foreground">{offer.subtitle}</p>
        ) : null}
      </CardHeader>
      <CardContent>
        {infoItems.length ? (
          <ul className="flex flex-wrap gap-10 text-base font-medium mb-6">
            {infoItems.map(({ icon: Icon, primary, secondary, isEmail, colorClass }) => (
              <li key={`${primary}-${secondary ?? ''}`} className="flex items-center gap-2">
                <Icon className={`h-6 w-6 ${colorClass ?? 'text-[var(--glenat-livre)]'}`} />
                <div
                  className={
                    secondary
                      ? 'flex flex-col justify-center leading-tight'
                      : 'flex items-center h-6'
                  }
                >
                  <span>{primary}</span>
                  {secondary ? (
                    isEmail ? (
                      <a
                        className="block text-xs text-primary underline"
                        href={`mailto:${secondary}`}
                      >
                        {secondary}
                      </a>
                    ) : (
                      <span className="block text-xs text-muted-foreground">{secondary}</span>
                    )
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : null}
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="flex justify-start border-b bg-transparent p-0 text-sm text-muted-foreground rounded-none">
            <TabsTrigger
              value="resume"
              className="w-32 rounded-none border-b-2 border-transparent px-4 py-2 flex items-center justify-center text-center data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              RÉSUMÉ
            </TabsTrigger>
            <TabsTrigger
              value="mission"
              className="w-32 rounded-none border-b-2 border-transparent px-4 py-2 flex items-center justify-center text-center data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              MISSION
            </TabsTrigger>
            <TabsTrigger
              value="profil"
              className="w-32 rounded-none border-b-2 border-transparent px-4 py-2 flex items-center justify-center text-center data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              PROFIL
            </TabsTrigger>
            <TabsTrigger
              value="avantages"
              className="w-32 rounded-none border-b-2 border-transparent px-4 py-2 flex items-center justify-center text-center data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              AVANTAGES
            </TabsTrigger>
          </TabsList>
          <TabsContent value="resume" className="mt-4">
            {renderHtmlContent(sections.resumeHtml)}
          </TabsContent>
          <TabsContent value="mission" className="mt-4">
            {renderHtmlContent(sections.missionHtml)}
          </TabsContent>
          <TabsContent value="profil" className="mt-4">
            {renderHtmlContent(sections.profilHtml)}
          </TabsContent>
          <TabsContent value="avantages" className="mt-4">
            {renderHtmlContent(sections.avantagesHtml)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default JobOffer;
