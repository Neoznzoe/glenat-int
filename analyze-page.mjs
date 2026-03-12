#!/usr/bin/env node
/**
 * Analyseur de page React/TSX → Inventaire Blocs & Éléments CMS
 * Usage: node analyze-page.mjs <fichier.tsx> [--verbose] [--no-interactive]
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { createInterface } from 'readline';

// ── Configuration ─────────────────────────────────────────────────────────────

const BLOCK_TAGS = new Set([
  'header', 'footer', 'main', 'nav', 'aside', 'section', 'article',
  'Card', 'CardHeader', 'CardContent', 'CardFooter',
  'Dialog', 'DialogContent', 'Sheet', 'SheetContent',
  'Tabs', 'TabsContent', 'Accordion', 'AccordionItem', 'AccordionContent',
  'Table', 'TableHeader', 'TableBody', 'TableRow',
  'DropdownMenu', 'DropdownMenuContent',
  'Sidebar', 'AlertDialog', 'AlertDialogContent',
]);

const ELEMENT_TAGS = new Set([
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'label', 'blockquote',
  'Label', 'CardTitle', 'CardDescription', 'DialogTitle', 'DialogDescription',
  'Badge', 'AlertDialogTitle', 'AlertDialogDescription',
  'img', 'video', 'audio', 'svg', 'iframe', 'Image', 'Avatar', 'AvatarImage',
  'a', 'button', 'input', 'textarea', 'select',
  'Button', 'Input', 'Textarea', 'Select', 'Switch', 'Checkbox',
  'SelectTrigger', 'SelectContent', 'SelectItem',
  'TableHead', 'TableCell', 'DropdownMenuItem',
]);

const BLOCK_CLASS_PATTERNS = [
  /grid/i, /flex/i, /container/i, /wrapper/i, /layout/i,
  /sidebar/i, /panel/i, /section/i, /card/i, /hero/i,
  /banner/i, /toolbar/i, /header/i, /footer/i, /nav/i,
  /content/i, /carousel/i, /list/i, /group/i, /space-y/i,
];

// Keywords that hint at business meaning from className, children, text
const CONTEXT_KEYWORDS = {
  hero: 'HERO', banner: 'BANNER', welcome: 'WELCOME', greeting: 'GREETING',
  search: 'SEARCH', filter: 'FILTER', sort: 'SORT',
  carousel: 'CAROUSEL', slider: 'SLIDER', swiper: 'SWIPER',
  stats: 'STATS', metrics: 'METRICS', kpi: 'KPI', dashboard: 'DASHBOARD',
  chart: 'CHART', graph: 'GRAPH',
  form: 'FORM', login: 'LOGIN', auth: 'AUTH', signup: 'SIGNUP',
  profile: 'PROFILE', avatar: 'AVATAR', user: 'USER',
  sidebar: 'SIDEBAR', menu: 'MENU', navigation: 'NAVIGATION', nav: 'NAV',
  toolbar: 'TOOLBAR', actions: 'ACTIONS',
  modal: 'MODAL', dialog: 'DIALOG', popup: 'POPUP',
  list: 'LIST', grid: 'GRID', gallery: 'GALLERY',
  table: 'TABLE', data: 'DATA',
  header: 'HEADER', footer: 'FOOTER', top: 'TOP', bottom: 'BOTTOM',
  title: 'TITLE', heading: 'HEADING',
  content: 'CONTENT', body: 'BODY', main: 'MAIN',
  card: 'CARD', panel: 'PANEL', widget: 'WIDGET',
  tabs: 'TABS', accordion: 'ACCORDION',
  notification: 'NOTIFICATION', alert: 'ALERT', toast: 'TOAST',
  loading: 'LOADING', skeleton: 'SKELETON', spinner: 'SPINNER',
  empty: 'EMPTY', placeholder: 'PLACEHOLDER',
  pagination: 'PAGINATION', pager: 'PAGER',
  breadcrumb: 'BREADCRUMB',
  calendar: 'CALENDAR', date: 'DATE', planning: 'PLANNING',
  book: 'BOOK', collection: 'COLLECTION', catalog: 'CATALOG',
  performance: 'PERFORMANCE', perf: 'PERF',
  comment: 'COMMENT', review: 'REVIEW',
  price: 'PRICE', cost: 'COST',
  image: 'IMAGE', photo: 'PHOTO', cover: 'COVER',
  video: 'VIDEO', media: 'MEDIA',
  social: 'SOCIAL', share: 'SHARE',
  download: 'DOWNLOAD', export: 'EXPORT',
  upload: 'UPLOAD', import: 'IMPORT',
  settings: 'SETTINGS', config: 'CONFIG', preferences: 'PREFERENCES',
  editor: 'EDITOR', wysiwyg: 'WYSIWYG',
  preview: 'PREVIEW', detail: 'DETAIL', details: 'DETAILS',
  summary: 'SUMMARY', overview: 'OVERVIEW',
  recent: 'RECENT', latest: 'LATEST', new: 'NEW',
  popular: 'POPULAR', trending: 'TRENDING', featured: 'FEATURED',
  bonjour: 'WELCOME', bienvenue: 'WELCOME',
  nouveaute: 'NEW_RELEASES', nouveautes: 'NEW_RELEASES',
  selection: 'SELECTION', decouvrir: 'DISCOVER',
  actualite: 'NEWS', actualites: 'NEWS',
  agenda: 'AGENDA', evenement: 'EVENT', evenements: 'EVENTS',
};

// ── Couleurs terminal ─────────────────────────────────────────────────────────

const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  blue: '\x1b[1;34m',
  cyan: '\x1b[0;36m',
  green: '\x1b[0;32m',
  yellow: '\x1b[0;33m',
  gray: '\x1b[0;90m',
  red: '\x1b[0;31m',
  magenta: '\x1b[0;35m',
};

// ── Parser ────────────────────────────────────────────────────────────────────

function classify(tag, props) {
  if (BLOCK_TAGS.has(tag)) return 'BLOC';
  if (ELEMENT_TAGS.has(tag)) return 'ELEMENT';
  if (tag === 'div' || tag === 'form') {
    const cn = props.className || '';
    if (BLOCK_CLASS_PATTERNS.some(p => p.test(cn))) return 'BLOC';
    return 'BLOC_MAYBE';
  }
  if (/^(use|set|const|let|var|if|return|else)/.test(tag)) return 'SKIP';
  if (tag[0] && tag[0] === tag[0].toUpperCase() && !ELEMENT_TAGS.has(tag)) return 'COMPONENT';
  return 'SKIP';
}

function extractJsxReturn(content) {
  const candidates = [];
  const re = /return\s*\(/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const afterParen = content.slice(m.index + m[0].length, m.index + m[0].length + 20).trim();
    if (afterParen.startsWith(')') || afterParen.startsWith('(')) continue;
    candidates.push(m);
  }

  if (candidates.length === 0) return content;

  for (let c = candidates.length - 1; c >= 0; c--) {
    const match = candidates[c];
    let depth = 0;
    let start = null;

    for (let i = match.index; i < content.length; i++) {
      if (content[i] === '(') {
        depth++;
        if (start === null) start = i + 1;
      } else if (content[i] === ')') {
        depth--;
        if (depth === 0) {
          const block = content.slice(start, i);
          if (/<[A-Z]/.test(block) || /<[a-z]/.test(block)) {
            return block;
          }
          break;
        }
      }
    }
  }

  return content;
}

function extractProps(propsStr) {
  const props = {};
  const patterns = [
    [/className\s*=\s*["']([^"']*)["']/, 'className'],
    [/className\s*=\s*\{[`"]([^`"]*)[`"]\}/, 'className'],
    [/\bid\s*=\s*["']([^"']*)["']/, 'id'],
    [/placeholder\s*=\s*["']([^"']*)["']/, 'placeholder'],
    [/variant\s*=\s*["']([^"']*)["']/, 'variant'],
    [/src\s*=\s*["']([^"']*)["']/, 'src'],
    [/htmlFor\s*=\s*["']([^"']*)["']/, 'htmlFor'],
    [/\btitle\s*=\s*"([^"]*)"/, 'title'],
    [/\blinks\s*=\s*\{([^}]+)\}/, 'links'],
    [/\bcolumns\s*=\s*\{([^}]{0,40})/, 'columns'],
    [/\blabel\s*=\s*"([^"]*)"/, 'label'],
    [/\bname\s*=\s*"([^"]*)"/, 'name'],
    [/\btype\s*=\s*"([^"]*)"/, 'type'],
    [/\bicon\s*=\s*\{([^}]+)\}/, 'icon'],
  ];
  for (const [re, key] of patterns) {
    const m = propsStr.match(re);
    if (m) props[key] = m[1];
  }
  return props;
}

function parseJsx(jsx) {
  const nodes = [];
  const stack = [];

  const openTag = /<\s*([A-Za-z][A-Za-z0-9.]*)((?:\s+[a-zA-Z_][\w-]*(?:\s*=\s*(?:"[^"]*"|'[^']*'|\{[^}]*\}))?)*)\s*(\/?)>/g;
  const closeTag = /<\/\s*([A-Za-z][A-Za-z0-9.]*)\s*>/g;

  const allTags = [];

  let m;
  while ((m = openTag.exec(jsx)) !== null) {
    allTags.push({
      type: 'open',
      tag: m[1],
      propsStr: m[2] || '',
      selfClosing: m[3] === '/',
      pos: m.index,
      end: m.index + m[0].length,
    });
  }
  while ((m = closeTag.exec(jsx)) !== null) {
    allTags.push({
      type: 'close',
      tag: m[1],
      pos: m.index,
      end: m.index + m[0].length,
    });
  }

  allTags.sort((a, b) => a.pos - b.pos);

  for (let i = 0; i < allTags.length; i++) {
    const t = allTags[i];

    if (t.type === 'open') {
      const props = extractProps(t.propsStr);
      const nodeType = classify(t.tag, props);
      const node = { tag: t.tag, props, nodeType, children: [], text: '', depth: stack.length };

      const nextTag = allTags[i + 1];
      if (nextTag) {
        let text = jsx.slice(t.end, nextTag.pos).trim();
        text = text.replace(/\{[^}]+\}/g, '{...}').trim();
        if (text && text !== '{...}') {
          node.text = text.slice(0, 80);
        }
      }

      if (stack.length > 0) {
        stack[stack.length - 1].children.push(node);
      } else {
        nodes.push(node);
      }

      if (!t.selfClosing) {
        stack.push(node);
      }
    } else if (t.type === 'close') {
      while (stack.length > 0 && stack[stack.length - 1].tag !== t.tag) {
        stack.pop();
      }
      if (stack.length > 0) stack.pop();
    }
  }

  return nodes;
}

// ── Résolution des imports & parsing des composants ───────────────────────────

/**
 * Parse les imports d'un fichier TSX et retourne une map:
 * componentName → chemin relatif du fichier source
 * Ex: { LinksCard: '@/components/LinksCard', EventsCalendar: '@/components/EventsCalendar' }
 */
function extractImports(fileContent) {
  const imports = {};
  const re = /import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(fileContent)) !== null) {
    const names = m[1].split(',').map(s => s.trim().replace(/\s+as\s+\w+/, ''));
    const path = m[2];
    for (const name of names) {
      // Skip types, hooks, utils
      if (name.startsWith('type ') || name.startsWith('use') || /^fetch|^type\s/.test(name)) continue;
      // Only keep PascalCase names (components)
      if (name[0] && name[0] === name[0].toUpperCase() && /^[A-Z]/.test(name)) {
        imports[name] = path;
      }
    }
  }
  return imports;
}

/**
 * Extrait les imports de données (camelCase) depuis un fichier source.
 * Retourne une map: variableName → importPath
 * Ex: { usefulLinks: '@/data/homeData', companyLifeLinks: '@/data/homeData' }
 */
function extractDataImports(fileContent) {
  const dataImports = {};
  const re = /import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(fileContent)) !== null) {
    const names = m[1].split(',').map(s => s.trim().replace(/\s+as\s+\w+/, ''));
    const path = m[2];
    // Only consider data-like paths (contains /data/ or starts with lowercase)
    for (const name of names) {
      if (!name || name.startsWith('type ')) continue;
      // camelCase data variables (start with lowercase, not hooks/fetch)
      if (/^[a-z]/.test(name) && !name.startsWith('use') && !name.startsWith('fetch')) {
        dataImports[name] = path;
      }
    }
  }
  return dataImports;
}

/**
 * Résout un chemin d'import (@/... ou relatif) vers un chemin fichier absolu.
 * Essaie .tsx, .ts, .jsx, .js et /index.tsx
 */
function resolveImportPath(importPath, sourceDir, projectRoot) {
  // Remplacer @/ par src/
  let resolved = importPath;
  if (resolved.startsWith('@/')) {
    resolved = join(projectRoot, 'src', resolved.slice(2));
  } else if (resolved.startsWith('./') || resolved.startsWith('../')) {
    resolved = resolve(sourceDir, resolved);
  } else {
    return null; // node_modules, skip
  }

  // Essayer les extensions
  const extensions = ['.tsx', '.ts', '.jsx', '.js'];
  for (const ext of extensions) {
    const fullPath = resolved + ext;
    if (existsSync(fullPath)) return fullPath;
  }
  // Essayer index
  for (const ext of extensions) {
    const indexPath = join(resolved, 'index' + ext);
    if (existsSync(indexPath)) return indexPath;
  }
  // Déjà avec extension ?
  if (existsSync(resolved)) return resolved;

  return null;
}

/**
 * Parse un fichier composant et retourne ses éléments/blocs de premier niveau.
 * Ne descend pas récursivement dans les sous-composants.
 */
// Tags structurels/wrappers : on traverse à travers eux pour trouver le contenu visible
const WRAPPER_TAGS = new Set([
  'Card', 'CardHeader', 'CardContent', 'CardFooter', 'CardTitle', 'CardDescription',
  'div', 'form', 'main', 'section', 'article', 'aside',
  'Dialog', 'DialogContent', 'Sheet', 'SheetContent',
  'Tabs', 'TabsContent', 'AccordionItem', 'AccordionContent',
  'DropdownMenu', 'DropdownMenuContent',
]);

// Tags qui représentent des éléments visibles à collecter
const VISIBLE_ELEMENT_TAGS = new Set([
  // Texte
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'label', 'blockquote',
  'CardTitle', 'CardDescription',
  // Médias
  'img', 'Image', 'Avatar', 'AvatarImage', 'video', 'audio', 'iframe',
  // Interactifs
  'a', 'button', 'Button', 'input', 'Input', 'textarea', 'Textarea',
  'select', 'Select', 'Switch', 'Checkbox',
  // Listes & données
  'Badge', 'ul', 'ol', 'table',
  'Table', 'TableHead', 'TableCell', 'TableRow',
  // Indicateurs
  'Calendar',
]);

// Tags icône à ignorer lors du parsing des composants (pas des éléments métier)
const ICON_TAGS = new Set([
  'svg', 'SquareArrowOutUpRight', 'CircleHelp', 'HomeIcon', 'Search',
  'ChevronDown', 'ChevronUp', 'ChevronLeft', 'ChevronRight',
  'X', 'Check', 'Plus', 'Minus', 'Loader2', 'Star',
]);

function parseComponentFile(filePath) {
  if (!filePath || !existsSync(filePath)) return null;

  try {
    const content = readFileSync(filePath, 'utf-8');
    const jsx = extractJsxReturn(content);
    const tree = parseJsx(jsx);

    if (tree.length === 0) return null;

    // Collecter les éléments visibles en traversant les wrappers
    const collected = [];
    collectVisibleElements(tree, collected, 0);

    return collected;
  } catch {
    return null;
  }
}

/**
 * Traverse l'arbre JSX en passant à travers les wrappers structurels
 * et collecte les éléments visibles (texte, boutons, images, listes, etc.)
 * Profondeur max pour éviter une explosion.
 */
function collectVisibleElements(nodes, collected, depth) {
  if (depth > 6) return; // sécurité

  for (const node of nodes) {
    const tag = node.tag;

    // Skip les composants utilitaires et les icônes
    if (SKIP_COMPONENTS.has(tag)) continue;
    if (ICON_TAGS.has(tag)) continue;

    // Si c'est un élément visible → le collecter
    if (VISIBLE_ELEMENT_TAGS.has(tag)) {
      collected.push(node);
      continue; // ne pas descendre dans ses enfants
    }

    // li → wrapper, traverser pour trouver le contenu (a, span, etc.)
    if (tag === 'li') {
      // Mais si le li a du texte ou des éléments visibles directs, on collecte le li
      const hasVisibleChild = node.children.some(c => VISIBLE_ELEMENT_TAGS.has(c.tag));
      if (hasVisibleChild) {
        // Traverse le li pour ses enfants visibles
        collectVisibleElements(node.children, collected, depth + 1);
      } else {
        // Li simple avec texte → collecter comme élément
        collected.push(node);
      }
      continue;
    }

    // Si c'est un wrapper structurel → traverser ses enfants
    if (WRAPPER_TAGS.has(tag) || node.nodeType === 'SKIP') {
      collectVisibleElements(node.children, collected, depth + 1);
      continue;
    }

    // Si c'est un composant custom non-wrapper (ex: SearchModule, SecureLink)
    // qui n'est pas une icône → le collecter
    if (node.nodeType === 'COMPONENT') {
      collected.push(node);
      continue;
    }

    // Sinon (BLOC_MAYBE etc.) → traverser
    collectVisibleElements(node.children, collected, depth + 1);
  }
}

/**
 * Convertit les noeuds visibles collectés en éléments d'inventaire CMS
 */
function componentNodesToElements(nodes, blockName) {
  const elements = [];

  for (const node of nodes) {
    const tag = node.tag;
    let type, name;

    if (VISIBLE_ELEMENT_TAGS.has(tag) || ELEMENT_TAGS.has(tag)) {
      type = suggestElementType(tag);
      name = inferElementName(node, blockName);
    } else if (node.nodeType === 'COMPONENT') {
      if (SKIP_COMPONENTS.has(tag) || ICON_TAGS.has(tag)) continue;
      // Composant interne (SearchModule, SecureLink, etc.)
      type = 'component';
      const snakeName = camelToSnake(tag);
      name = `${blockName}_${snakeName}`;
    } else {
      type = 'section';
      name = inferBlockName(node);
    }

    elements.push({
      tag,
      text: node.text || '',
      type,
      suggestedName: name,
      finalName: name,
      node,
      synthetic: false,
      fromSource: true,
    });
  }

  return elements;
}

// ── Nommage contextuel intelligent ────────────────────────────────────────────

/**
 * Convertit un nom CamelCase en SNAKE_CASE
 * Ex: "ActualitesCard" → "ACTUALITES_CARD", "EventsCalendar" → "EVENTS_CALENDAR"
 */
function camelToSnake(str) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .toUpperCase();
}

// Composants UI utilitaires à ignorer pour le nommage
const SKIP_COMPONENTS = new Set([
  'Skeleton', 'Spinner', 'Loader', 'Loading',
  'Suspense', 'ErrorBoundary', 'Fragment',
  'Tooltip', 'TooltipContent', 'TooltipTrigger', 'TooltipProvider',
  'ScrollArea', 'ScrollBar', 'Separator',
]);

/**
 * Extrait les composants enfants en 2 passes :
 * - Pass 1 : enfants directs uniquement (composants au 1er niveau)
 * - Pass 2 : si rien trouvé, descend à maxDepth
 * Filtre les composants UI utilitaires (Skeleton, etc.)
 */
function getChildComponents(node, maxDepth = 2) {
  const components = [];

  // Also check the node's own text for embedded component references
  if (node.text) {
    const regex = /<([A-Z][A-Za-z]+)\s+(?:[^>]*?)title="([^"]+)"/g;
    let embeddedMatch;
    while ((embeddedMatch = regex.exec(node.text)) !== null) {
      if (!SKIP_COMPONENTS.has(embeddedMatch[1])) {
        components.push({
          name: embeddedMatch[1],
          title: embeddedMatch[2],
          snakeName: camelToSnake(embeddedMatch[1]),
        });
      }
    }
  }

  function walk(children, depth) {
    if (depth > maxDepth) return;
    for (const child of children) {
      if (child.nodeType === 'COMPONENT' && !SKIP_COMPONENTS.has(child.tag)) {
        components.push({
          name: child.tag,
          title: child.props.title || null,
          snakeName: camelToSnake(child.tag),
        });
      }
      // Check text content for embedded component references
      if (child.text) {
        const regex = /<([A-Z][A-Za-z]+)\s+(?:[^>]*?)title="([^"]+)"/g;
        let embeddedMatch;
        while ((embeddedMatch = regex.exec(child.text)) !== null) {
          if (!SKIP_COMPONENTS.has(embeddedMatch[1])) {
            components.push({
              name: embeddedMatch[1],
              title: embeddedMatch[2],
              snakeName: camelToSnake(embeddedMatch[1]),
            });
          }
        }
      }
      walk(child.children, depth + 1);
    }
  }

  // Pass 1: direct children only
  walk(node.children, maxDepth); // will only process depth 0 → maxDepth
  // Actually let's do it properly: first try shallow, then deep
  return components;
}

/**
 * Comme getChildComponents mais uniquement les enfants directs (profondeur 0)
 */
function getDirectChildComponents(node) {
  const components = [];

  // Check node's own text
  if (node.text) {
    const regex = /<([A-Z][A-Za-z]+)\s+(?:[^>]*?)title="([^"]+)"/g;
    let m;
    while ((m = regex.exec(node.text)) !== null) {
      if (!SKIP_COMPONENTS.has(m[1])) {
        components.push({ name: m[1], title: m[2], snakeName: camelToSnake(m[1]) });
      }
    }
  }

  for (const child of node.children) {
    if (child.nodeType === 'COMPONENT' && !SKIP_COMPONENTS.has(child.tag)) {
      components.push({
        name: child.tag,
        title: child.props.title || null,
        snakeName: camelToSnake(child.tag),
      });
    }
    // Check child text for embedded refs
    if (child.text) {
      const regex = /<([A-Z][A-Za-z]+)\s+(?:[^>]*?)title="([^"]+)"/g;
      let m;
      while ((m = regex.exec(child.text)) !== null) {
        if (!SKIP_COMPONENTS.has(m[1])) {
          components.push({ name: m[1], title: m[2], snakeName: camelToSnake(m[1]) });
        }
      }
    }
  }
  return components;
}

/**
 * Extrait les props title des enfants directs et du noeud lui-même
 */
function getChildTitles(node) {
  const titles = [];
  if (node.props.title) titles.push(node.props.title);

  for (const child of node.children) {
    if (child.props.title) titles.push(child.props.title);
    // Check text for title="..." patterns
    if (child.text) {
      const m = child.text.match(/title="([^"]+)"/);
      if (m) titles.push(m[1]);
    }
  }
  return titles;
}

/**
 * Convertit un titre français/anglais en identifiant SNAKE_CASE
 * Ex: "Absent aujourd'hui" → "ABSENT", "En visite chez nous" → "VISITE"
 */
function titleToCode(title) {
  // Map common French phrases to short codes
  const TITLE_MAPPINGS = {
    "absent aujourd'hui": 'ABSENT',
    "télétravail aujourd'hui": 'TELETRAVAIL',
    "en visite chez nous": 'VISITORS',
    "en déplacement aujourd'hui": 'DEPLACEMENT',
    "déplacement prévu": 'DEPLACEMENT_PREVU',
    "sites utiles": 'LIENS_UTILES',
    "vie de l'entreprise": 'VIE_ENTREPRISE',
    "sites share point": 'SHAREPOINT',
    "aucune couverture disponible": 'COVER_PLACEHOLDER',
  };

  // Normalise les apostrophes typographiques (', ') en apostrophe ASCII (')
  const lower = title.toLowerCase().trim().replace(/[\u2018\u2019\u201A\u201B]/g, "'");
  if (TITLE_MAPPINGS[lower]) return TITLE_MAPPINGS[lower];

  // Generic: take first 2-3 meaningful words
  const words = lower
    .replace(/[^a-zàâäéèêëïîôùûüç0-9\s]/gi, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !['les', 'des', 'une', 'aux', 'pour', 'dans', 'avec', 'chez', 'nous', 'sur', 'par'].includes(w))
    .slice(0, 2);

  return words.map(w => w.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')).join('_') || title.toUpperCase().slice(0, 15).replace(/[^A-Z0-9]/g, '_');
}

/**
 * Compte le nombre total de noeuds enfants (récursif) pour détecter les containers larges
 */
function countDescendants(node) {
  let count = node.children.length;
  for (const child of node.children) {
    count += countDescendants(child);
  }
  return count;
}

/**
 * Infère un nom de bloc intelligent en se basant sur (par priorité) :
 * 1. Les props title (du noeud ou composants enfants directs)
 * 2. Les noms des composants enfants DIRECTS
 * 3. Le tag HTML sémantique (header, footer, nav, etc.)
 * 4. Les classes CSS métier (hero, banner, etc.)
 * 5. Le contenu texte des enfants directs
 * 6. Fallback tag + classe
 *
 * IMPORTANT: Pour les grands containers (>15 descendants), on ne regarde que
 * les enfants directs pour éviter de nommer le container racine d'après
 * un composant profondément imbriqué.
 */
/**
 * Nom de bloc pour un composant React custom (ActualitesCard, LinksCard, etc.)
 * Utilise le title prop si dispo, sinon le nom CamelCase → SNAKE_CASE
 */
function inferComponentBlockName(node) {
  const snakeName = camelToSnake(node.tag);

  // Si le composant a un title prop, l'utiliser
  if (node.props.title) {
    const code = titleToCode(node.props.title);
    // Ajouter un suffixe basé sur le type de composant
    const typeSuffix = node.tag.match(/(List|Card|Table|Grid|Calendar|Chart|Form|Panel|Dialog|Modal|Menu|Carousel)$/i);
    if (typeSuffix) {
      return `${code}_${typeSuffix[1].toUpperCase()}`;
    }
    return code;
  }

  // Pas de title → utiliser le nom du composant directement
  // Ex: ActualitesCard → ACTUALITES_CARD, EventsCalendar → EVENTS_CALENDAR
  return snakeName;
}

/**
 * Génère des éléments synthétiques pour un composant auto-fermant (pas d'enfants parsés).
 * Déduit les éléments à partir des props et du type de composant.
 * Ex: <LinksCard title="Sites utiles" links={usefulLinks} />
 *   → TITLE (heading), LINKS_LIST (list), LINK_ITEM (link)
 */
/**
 * Cache global pour les tableaux de données résolus.
 * Rempli par le main au démarrage (après parsing des imports).
 */
const dataArrayCache = new Map();

/**
 * Parse un fichier de données TS/JS et extrait les tableaux exportés.
 * Supporte: export const varName: Type[] = [ { label: '...', ... }, ... ];
 */
function parseDataFile(filePath) {
  if (!filePath || !existsSync(filePath)) return {};

  try {
    const content = readFileSync(filePath, 'utf-8');
    const result = {};

    // Match: export const varName ... = [ ... ];
    const re = /export\s+const\s+(\w+)[\s:][^=]*=\s*\[/g;
    let m;
    while ((m = re.exec(content)) !== null) {
      const varName = m[1];
      const startIdx = m.index + m[0].length - 1; // position du [

      // Trouver le ] correspondant
      let depth = 0;
      let endIdx = startIdx;
      for (let i = startIdx; i < content.length; i++) {
        if (content[i] === '[') depth++;
        else if (content[i] === ']') {
          depth--;
          if (depth === 0) { endIdx = i + 1; break; }
        }
      }

      const arrayStr = content.slice(startIdx, endIdx);

      // Extraire les objets { label: '...', ... }
      const items = [];
      const objRe = /\{\s*([^}]+)\}/g;
      let objMatch;
      while ((objMatch = objRe.exec(arrayStr)) !== null) {
        const objContent = objMatch[1];
        const item = {};

        // Extraire les propriétés clés: label, name, title, href
        const propRe = /(\w+)\s*:\s*(?:'([^']*)'|"([^"]*)")/g;
        let propMatch;
        while ((propMatch = propRe.exec(objContent)) !== null) {
          item[propMatch[1]] = propMatch[2] || propMatch[3];
        }

        if (Object.keys(item).length > 0) {
          items.push(item);
        }
      }

      result[varName] = items;
    }

    return result;
  } catch {
    return {};
  }
}

/**
 * Résout un nom de variable passé en prop vers son tableau de données.
 * Ex: "usefulLinks" → [{ label: 'CSE Glénat', href: '#' }, ...]
 */
function resolveDataArray(varRef) {
  // varRef est le contenu brut du prop: ex "usefulLinks" ou "companyLifeLinks"
  // Nettoyer: enlever les accolades {} si présents
  const varName = varRef.replace(/[{}]/g, '').trim();
  return dataArrayCache.get(varName) || null;
}

function generateComponentElements(node, blockName) {
  const elements = [];
  const props = node.props;
  const tag = node.tag;

  // 1. Si le composant a un title → élément heading
  if (props.title) {
    elements.push({
      tag: 'title',
      text: props.title,
      type: 'heading',
      suggestedName: `${blockName}_TITLE`,
      finalName: `${blockName}_TITLE`,
      node,
      synthetic: true,
    });
  }

  // 2. Déduire des éléments selon le pattern du composant
  const tagLower = tag.toLowerCase();

  // Card pattern: content area
  if (/card$/i.test(tag)) {
    elements.push({
      tag: 'content',
      text: '',
      type: 'text',
      suggestedName: `${blockName}_CONTENT`,
      finalName: `${blockName}_CONTENT`,
      node,
      synthetic: true,
    });
  }

  // List pattern: résoudre les données réelles si possible
  if (/list$/i.test(tag) || props.columns || props.links) {
    // Essayer de résoudre le tableau de données passé en prop
    const dataVarName = props.links || props.columns || null;
    const dataItems = dataVarName ? resolveDataArray(dataVarName) : null;

    if (dataItems && dataItems.length > 0) {
      // Générer un élément par entrée réelle du tableau
      for (const item of dataItems) {
        const label = item.label || item.name || item.title || 'item';
        const code = label.toUpperCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/[^A-Z0-9]+/g, '_')
          .replace(/^_|_$/g, '')
          .slice(0, 40);
        elements.push({
          tag: 'link-item',
          text: label,
          type: 'link',
          suggestedName: code,
          finalName: code,
          node,
          synthetic: true,
          fromData: true,
        });
      }
    } else {
      // Fallback: élément générique list + item
      elements.push({
        tag: 'list',
        text: '',
        type: 'list',
        suggestedName: `${blockName}_LIST`,
        finalName: `${blockName}_LIST`,
        node,
        synthetic: true,
      });
      elements.push({
        tag: 'list-item',
        text: '',
        type: 'list_item',
        suggestedName: `${blockName}_ITEM`,
        finalName: `${blockName}_ITEM`,
        node,
        synthetic: true,
      });
    }
  }

  // Calendar pattern
  if (/calendar$/i.test(tag)) {
    elements.push({
      tag: 'calendar',
      text: '',
      type: 'widget',
      suggestedName: `${blockName}_WIDGET`,
      finalName: `${blockName}_WIDGET`,
      node,
      synthetic: true,
    });
    elements.push({
      tag: 'event-item',
      text: '',
      type: 'list_item',
      suggestedName: `${blockName}_EVENT`,
      finalName: `${blockName}_EVENT`,
      node,
      synthetic: true,
    });
  }

  // Carousel pattern
  if (/carousel|slider|swiper$/i.test(tag)) {
    elements.push({
      tag: 'slide',
      text: '',
      type: 'media',
      suggestedName: `${blockName}_SLIDE`,
      finalName: `${blockName}_SLIDE`,
      node,
      synthetic: true,
    });
    elements.push({
      tag: 'controls',
      text: '',
      type: 'button',
      suggestedName: `${blockName}_CONTROLS`,
      finalName: `${blockName}_CONTROLS`,
      node,
      synthetic: true,
    });
  }

  // Si on a trouvé des props mais aucun pattern spécifique → élément générique "content"
  if (elements.length === 0) {
    elements.push({
      tag: 'content',
      text: '',
      type: 'component',
      suggestedName: `${blockName}_CONTENT`,
      finalName: `${blockName}_CONTENT`,
      node,
      synthetic: true,
    });
  }

  // 3. Ajouter les props spécifiques comme éléments
  if (props.icon) {
    elements.push({
      tag: 'icon',
      text: props.icon,
      type: 'image',
      suggestedName: `${blockName}_ICON`,
      finalName: `${blockName}_ICON`,
      node,
      synthetic: true,
    });
  }

  if (props.src) {
    elements.push({
      tag: 'image',
      text: props.src,
      type: 'image',
      suggestedName: `${blockName}_IMAGE`,
      finalName: `${blockName}_IMAGE`,
      node,
      synthetic: true,
    });
  }

  return elements;
}

function inferBlockName(node) {
  const cn = (node.props.className || '').toLowerCase();
  const descendants = countDescendants(node);
  const isLargeContainer = descendants > 15;

  // ── Priority 0: Detect page-level containers ──
  // If this is a very large container at depth 0 with generic classes, it's the page wrapper
  if (isLargeContainer && node.depth === 0 && /^div|form$/.test(node.tag)) {
    if (/space-y|gap|flex.*col/i.test(cn)) return 'PAGE_CONTAINER';
  }

  // ── Priority 0b: Node's own text contains component refs with title ──
  // Handles BLOC_MAYBE divs that wrap components not parsed as real tags
  if (node.text) {
    const regex = /<([A-Z][A-Za-z]+)\s+(?:[^>]*?)title="([^"]+)"/g;
    let m;
    while ((m = regex.exec(node.text)) !== null) {
      if (!SKIP_COMPONENTS.has(m[1])) {
        const code = titleToCode(m[2]);
        const typeSuffix = m[1].match(/(List|Card|Table|Grid|Calendar|Chart|Form|Panel|Dialog|Modal|Menu)$/i);
        if (typeSuffix) return `${code}_${typeSuffix[1].toUpperCase()}`;
        return code;
      }
    }
  }

  // ── Priority 1: Direct child component analysis ──
  const directComps = getDirectChildComponents(node);

  if (directComps.length > 0) {
    const compTypes = [...new Set(directComps.map(c => c.name))];

    // If multiple children of the SAME component type (e.g., 3x LinksCard, 2x PresenceList)
    // → use the component TYPE name for the section, not one specific title
    if (directComps.length > 1 && compTypes.length === 1) {
      return camelToSnake(compTypes[0]).replace(/_CARD$|_LIST$/, '') + '_SECTION';
    }

    // Single component or mixed: use title if available
    for (const comp of directComps) {
      if (comp.title) {
        const code = titleToCode(comp.title);
        const typeSuffix = comp.name.match(/(List|Card|Table|Grid|Calendar|Chart|Form|Panel|Dialog|Modal|Menu)$/i);
        if (typeSuffix) {
          return `${code}_${typeSuffix[1].toUpperCase()}`;
        }
        return code;
      }
    }

    // No titles: use component type name
    const mainComp = directComps[0];
    return mainComp.snakeName.replace(/_CARD$|_COMPONENT$/, '') + '_SECTION';
  }

  // ── Priority 3: Semantic HTML tags ──
  const tag = node.tag.toLowerCase();
  const SEMANTIC_NAMES = {
    header: 'HEADER', footer: 'FOOTER', nav: 'NAVIGATION',
    main: 'MAIN_CONTENT', aside: 'SIDEBAR', section: 'SECTION', article: 'ARTICLE',
  };
  if (SEMANTIC_NAMES[tag]) {
    // Try to enrich with direct child components
    if (directComps.length > 0) {
      return `${directComps[0].snakeName}_${SEMANTIC_NAMES[tag]}`;
    }
    return SEMANTIC_NAMES[tag];
  }

  // ── Priority 4: CSS class patterns (specific) ──
  const CSS_BLOCK_PATTERNS = [
    [/hero/i, 'HERO'], [/banner/i, 'BANNER'], [/carousel/i, 'CAROUSEL'],
    [/sidebar/i, 'SIDEBAR'], [/toolbar/i, 'TOOLBAR'], [/panel/i, 'PANEL'],
  ];
  for (const [pattern, name] of CSS_BLOCK_PATTERNS) {
    if (pattern.test(cn)) return name;
  }

  // ── Priority 5: Grid layouts - name by direct children ──
  if (/grid/.test(cn)) {
    // For large grid containers, check what they contain
    if (directComps.length > 0) {
      // If all are same component, use component name
      const compNames = [...new Set(directComps.map(c => c.name))];
      if (compNames.length === 1) {
        // All same: use component name as section name
        return camelToSnake(compNames[0]).replace(/_CARD$|_LIST$/, '') + '_SECTION';
      }
      // Mixed: use the first specific one
      return camelToSnake(compNames[0]).replace(/_CARD$|_LIST$/, '') + '_SECTION';
    }

    // Check ALL children (blocs, bloc_maybe, components) and their contents
    const allChildComps = [];
    for (const child of node.children) {
      // Direct child components (including parsing text for embedded refs)
      allChildComps.push(...getDirectChildComponents(child));
      // Also check deeper - Card > CardContent > Component, or BLOC_MAYBE > Component
      for (const gc of child.children) {
        allChildComps.push(...getDirectChildComponents(gc));
        for (const ggc of gc.children) {
          allChildComps.push(...getDirectChildComponents(ggc));
        }
      }
    }

    if (allChildComps.length > 0) {
      // Find the main component type used across all children
      const compTypes = [...new Set(allChildComps.map(c => c.name))];
      // Always use the component TYPE name for grid sections (not the first title)
      // This ensures grids with multiple PresenceList become PRESENCE_SECTION,
      // not ABSENT_SECTION
      const mainType = compTypes[0];
      return camelToSnake(mainType).replace(/_CARD$|_LIST$/, '') + '_SECTION';
    }

    return 'GRID_SECTION';
  }

  // col-span: this is a column within a grid
  // BUT Card/CardContent with col-span should use Card handler instead
  if (/col-span/.test(cn) && !['Card', 'CardContent', 'CardHeader', 'CardFooter'].includes(node.tag)) {
    // Look at what's inside
    const deepComps = getChildComponents(node, 2);
    if (deepComps.length > 0) {
      if (deepComps[0].title) return `${titleToCode(deepComps[0].title)}_COLUMN`;
      return `${deepComps[0].snakeName.replace(/_CARD$/, '')}_COLUMN`;
    }

    // Check ALL text from descendants (2 levels deep)
    const childTexts = [];
    function collectTexts(children, depth) {
      if (depth > 2) return;
      for (const child of children) {
        if (child.text) childTexts.push(child.text);
        collectTexts(child.children, depth + 1);
      }
    }
    collectTexts(node.children, 0);

    if (childTexts.length > 0) {
      const allText = childTexts.join(' ');
      if (/bonjour|bienvenue|bonne\s+journ/i.test(allText)) return 'GREETING_COLUMN';
      if (/carousel|infinitecarousel/i.test(allText)) return 'CAROUSEL_COLUMN';
      if (/prochaine?\s+office/i.test(allText)) return 'CAROUSEL_COLUMN';
      if (/cover|couverture/i.test(allText)) return 'CAROUSEL_COLUMN';
    }
    return 'COLUMN';
  }

  // ── Priority 6: Text content (including children) ──
  const meaningfulTexts = [];
  if (node.text) meaningfulTexts.push(node.text);
  for (const child of node.children) {
    if (child.text && child.text.length > 2) {
      meaningfulTexts.push(child.text);
    }
  }

  if (meaningfulTexts.length > 0) {
    const allText = meaningfulTexts.join(' ');
    if (/bonjour|bienvenue|welcome/i.test(allText)) return 'GREETING';
    if (/prochaine?\s+office/i.test(allText)) return 'OFFICE_INFO';
    if (/aucune?\s+(couverture|cover)/i.test(allText)) return 'COVER_PLACEHOLDER';

    // Filter out {…}-only text and use first meaningful one
    const clean = meaningfulTexts.filter(t => !/^\{/.test(t.trim()) && t.length > 2);
    if (clean.length > 0) {
      const code = titleToCode(clean[0]);
      if (code && code.length > 2) return code;
    }

    // If children are headings (h1-h6), this is likely a title/date display bloc
    const childTags = node.children.map(c => c.tag.toLowerCase());
    if (childTags.some(t => /^h[1-6]$/.test(t))) return 'HEADING_BLOC';
  }

  // ── Priority 7: Card/Dialog wrappers - look deeper ──
  if (['Card', 'CardContent', 'CardHeader', 'CardFooter'].includes(node.tag)) {
    const deepComps = getChildComponents(node, 4);
    if (deepComps.length > 0) {
      const suffix = node.tag === 'CardContent' ? '_CONTENT' : '_CARD';
      if (deepComps[0].title) {
        return `${titleToCode(deepComps[0].title)}${suffix}`;
      }
      return `${deepComps[0].snakeName.replace(/_CARD$/, '')}${suffix}`;
    }
    return node.tag === 'CardContent' ? 'CARD_CONTENT' : 'CARD';
  }

  if (['Dialog', 'DialogContent', 'AlertDialog', 'AlertDialogContent'].includes(node.tag)) {
    return 'DIALOG';
  }
  if (['Table', 'TableHeader', 'TableBody'].includes(node.tag)) {
    return 'DATA_TABLE';
  }

  // ── Priority 8: rounded-xl/bg-card → decorative card wrapper ──
  if (/rounded|bg-card|border-border/i.test(cn)) {
    const deepComps = getChildComponents(node, 3);
    if (deepComps.length > 0) {
      if (deepComps[0].title) return `${titleToCode(deepComps[0].title)}_WRAPPER`;
      return `${deepComps[0].snakeName.replace(/_CARD$/, '')}_CARD`;
    }
    // Check descendants for greeting/carousel hints
    const childTexts = [];
    function collectDeepTexts(children, depth) {
      if (depth > 3) return;
      for (const child of children) {
        if (child.text) childTexts.push(child.text);
        collectDeepTexts(child.children, depth + 1);
      }
    }
    collectDeepTexts(node.children, 0);
    const allText = childTexts.join(' ');
    if (/bonjour|greeting|bienvenue/i.test(allText)) return 'HERO_CARD';
    if (/carousel|office/i.test(allText)) return 'HERO_CARD';
  }

  // ── Fallback: tag + first meaningful class ──
  const firstClass = (node.props.className || '').split(/\s+/)[0];
  if (firstClass && firstClass.length > 2) {
    return `${node.tag.toUpperCase()}_${firstClass.toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 15)}`;
  }
  return node.tag.toUpperCase();
}

function inferElementName(node, parentBlockName) {
  const tag = node.tag.toLowerCase();
  const type = suggestElementType(tag);

  // Priority 1: id or htmlFor
  if (node.props.id) return node.props.id.toUpperCase().replace(/[^A-Z0-9]/g, '_');
  if (node.props.htmlFor) return `LABEL_${node.props.htmlFor.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;

  // Priority 2: placeholder
  if (node.props.placeholder) {
    const clean = node.props.placeholder.toUpperCase().replace(/[^A-Z0-9]+/g, '_').slice(0, 30).replace(/^_|_$/g, '');
    return clean;
  }

  // Priority 3: text content → make it meaningful with parent context
  if (node.text && node.text.length < 50 && !node.text.includes('{...}')) {
    const code = titleToCode(node.text);
    if (code && code.length > 2) {
      // Prefix with element type for clarity
      return `${type.toUpperCase()}_${code}`;
    }
  }

  // Priority 4: variant for buttons
  if (node.props.variant) {
    return `${type.toUpperCase()}_${node.props.variant.toUpperCase()}`;
  }

  // Priority 5: heading level
  if (/^h[1-6]$/.test(tag)) {
    if (node.text) {
      const code = titleToCode(node.text);
      return `HEADING_${code}`;
    }
    if (parentBlockName) return `${parentBlockName}_TITLE`;
    return `HEADING_${tag.toUpperCase()}`;
  }

  // Fallback: parent context + type
  if (parentBlockName) {
    return `${parentBlockName}_${type.toUpperCase()}`;
  }
  return `${type.toUpperCase()}_${node.tag.toUpperCase()}`;
}

// ── Affichage ─────────────────────────────────────────────────────────────────

const TYPE_STYLE = {
  BLOC:       { color: C.blue,   icon: '■ BLOC  ' },
  BLOC_MAYBE: { color: C.cyan,   icon: '□ BLOC? ' },
  ELEMENT:    { color: C.green,  icon: '● ELEM  ' },
  COMPONENT:  { color: C.yellow, icon: '◆ COMP  ' },
  SKIP:       { color: C.gray,   icon: '  ···   ' },
};

function printTree(nodes, indent = 0, showSkip = false) {
  for (const node of nodes) {
    if (node.nodeType === 'SKIP' && !showSkip) {
      printTree(node.children, indent, showSkip);
      continue;
    }

    const style = TYPE_STYLE[node.nodeType] || TYPE_STYLE.SKIP;
    const pre = '│   '.repeat(indent);
    const conn = indent > 0 ? '├── ' : '';

    const extras = [];
    if (node.props.className) {
      const cn = node.props.className.length > 45
        ? node.props.className.slice(0, 45) + '...'
        : node.props.className;
      extras.push(`class="${cn}"`);
    }
    if (node.props.id) extras.push(`id="${node.props.id}"`);
    if (node.props.variant) extras.push(`variant="${node.props.variant}"`);
    if (node.props.placeholder) extras.push(`placeholder="${node.props.placeholder}"`);
    if (node.text) extras.push(`"${node.text}"`);

    const extraStr = extras.length ? ` ${C.dim}${extras.join(' ')}${C.reset}` : '';
    const visibleChildren = node.children.filter(c => c.nodeType !== 'SKIP').length;
    const childInfo = visibleChildren > 0 ? ` ${C.dim}(${visibleChildren} enfants)${C.reset}` : '';

    // Afficher le nom inféré pour BLOC, ELEMENT et COMPONENT
    let nameTag = '';
    if (node.nodeType === 'BLOC' || node.nodeType === 'BLOC_MAYBE') {
      const name = inferBlockName(node);
      nameTag = ` ${C.magenta}→ ${name}${C.reset}`;
    } else if (node.nodeType === 'ELEMENT') {
      const name = inferElementName(node, null);
      nameTag = ` ${C.magenta}→ ${name}${C.reset}`;
    } else if (node.nodeType === 'COMPONENT' && !SKIP_COMPONENTS.has(node.tag)) {
      const name = inferComponentBlockName(node);
      nameTag = ` ${C.magenta}→ ${name}${C.reset}`;
    }

    console.log(`${pre}${conn}${style.color}${style.icon} <${node.tag}>${C.reset}${extraStr}${nameTag}${childInfo}`);

    if (node.children.length > 0) {
      printTree(node.children, indent + 1, showSkip);
    }
  }
}

// ── Inventaire contextuel ─────────────────────────────────────────────────────

function suggestElementType(tag) {
  const t = tag.toLowerCase();
  if (/^h[1-6]$/.test(t)) return 'heading';
  if (['p', 'span', 'label', 'blockquote', 'cardtitle', 'carddescription', 'dialogtitle', 'dialogdescription', 'alertdialogtitle', 'alertdialogdescription'].includes(t)) return 'text';
  if (['img', 'image', 'avatar', 'avatarimage', 'svg'].includes(t)) return 'image';
  if (['video', 'audio', 'iframe'].includes(t)) return 'media';
  if (t === 'a') return 'link';
  if (['button', 'btn'].includes(t)) return 'button';
  if (['input', 'textarea', 'select', 'switch', 'checkbox', 'selecttrigger', 'selectcontent', 'selectitem'].includes(t)) return 'input';
  if (t === 'badge') return 'badge';
  if (['tablehead', 'tablecell'].includes(t)) return 'table_cell';
  if (t === 'dropdownmenuitem') return 'menu_item';
  return 'text';
}

/**
 * Collecte l'inventaire avec noms contextuels et relations parent-enfant.
 * Chaque bloc retient ses éléments enfants.
 */
function collectInventory(nodes, parentBlockName = null) {
  const blocs = [];
  const orphanElements = [];
  const components = [];

  for (const node of nodes) {
    if (node.nodeType === 'BLOC' || node.nodeType === 'BLOC_MAYBE') {
      const suggestedName = inferBlockName(node);
      const bloc = {
        tag: node.tag,
        className: node.props.className || '',
        suggestedName,
        finalName: suggestedName, // will be overridden in interactive mode
        elements: [],
        childBlocs: [],
        node,
      };

      // Collect direct element children and recurse
      collectBlocChildren(node.children, bloc);

      blocs.push(bloc);
    } else if (node.nodeType === 'ELEMENT') {
      orphanElements.push({
        tag: node.tag,
        text: node.text,
        type: suggestElementType(node.tag),
        suggestedName: inferElementName(node, parentBlockName),
        finalName: null, // set later
        node,
      });
      // Elements can have children too
      const sub = collectInventory(node.children, parentBlockName);
      orphanElements.push(...sub.orphanElements);
      components.push(...sub.components);
    } else if (node.nodeType === 'COMPONENT') {
      if (SKIP_COMPONENTS.has(node.tag)) {
        // Utility component: skip but recurse into children
        const sub = collectInventory(node.children, parentBlockName);
        blocs.push(...sub.blocs);
        orphanElements.push(...sub.orphanElements);
        components.push(...sub.components);
      } else {
        // Business component → treat as a bloc
        const suggestedName = inferComponentBlockName(node);
        const bloc = {
          tag: node.tag,
          className: node.props.className || '',
          suggestedName,
          finalName: suggestedName,
          elements: [],
          childBlocs: [],
          node,
          isComponent: true,
        };
        // Collect real children as sub-elements
        collectBlocChildren(node.children, bloc);
        // Si pas d'enfants réels (balise auto-fermante) → lire le fichier source du composant
        if (bloc.elements.length === 0 && bloc.childBlocs.length === 0) {
          const sourceElements = resolveAndParseComponent(node.tag, suggestedName);
          if (sourceElements && sourceElements.length > 0) {
            bloc.elements = sourceElements;
          } else {
            bloc.elements = generateComponentElements(node, suggestedName);
          }
        }
        blocs.push(bloc);
      }
    } else {
      // SKIP nodes - recurse
      const sub = collectInventory(node.children, parentBlockName);
      blocs.push(...sub.blocs);
      orphanElements.push(...sub.orphanElements);
      components.push(...sub.components);
    }
  }

  return { blocs, orphanElements, components };
}

function collectBlocChildren(children, bloc) {
  for (const child of children) {
    if (child.nodeType === 'ELEMENT') {
      bloc.elements.push({
        tag: child.tag,
        text: child.text,
        type: suggestElementType(child.tag),
        suggestedName: inferElementName(child, bloc.suggestedName),
        finalName: null,
        node: child,
      });
      // Recurse into element children too
      collectBlocChildren(child.children, bloc);
    } else if (child.nodeType === 'BLOC' || child.nodeType === 'BLOC_MAYBE') {
      const subBloc = {
        tag: child.tag,
        className: child.props.className || '',
        suggestedName: inferBlockName(child),
        finalName: null,
        elements: [],
        childBlocs: [],
        node: child,
      };
      collectBlocChildren(child.children, subBloc);
      bloc.childBlocs.push(subBloc);
    } else if (child.nodeType === 'COMPONENT') {
      if (SKIP_COMPONENTS.has(child.tag)) {
        // Utility component: skip but recurse
        collectBlocChildren(child.children, bloc);
      } else {
        // Business component → sub-bloc
        const compName = inferComponentBlockName(child);
        const subBloc = {
          tag: child.tag,
          className: child.props.className || '',
          suggestedName: compName,
          finalName: null,
          elements: [],
          childBlocs: [],
          node: child,
          isComponent: true,
        };
        collectBlocChildren(child.children, subBloc);
        // Si pas d'enfants réels → lire le fichier source ou générer synthétiques
        if (subBloc.elements.length === 0 && subBloc.childBlocs.length === 0) {
          const sourceElements = resolveAndParseComponent(child.tag, compName);
          if (sourceElements && sourceElements.length > 0) {
            subBloc.elements = sourceElements;
          } else {
            subBloc.elements = generateComponentElements(child, compName);
          }
        }
        bloc.childBlocs.push(subBloc);
      }
    } else {
      // SKIP - recurse
      collectBlocChildren(child.children, bloc);
    }
  }
}

/**
 * Aplatit l'arbre de blocs en liste plate, en préfixant les sous-blocs
 * avec le nom de leur parent.
 */
function flattenBlocs(blocs, parentName = null) {
  const flat = [];
  for (const bloc of blocs) {
    bloc.finalName = bloc.finalName || bloc.suggestedName;
    bloc.parentBlockName = parentName;
    flat.push(bloc);

    if (bloc.childBlocs.length > 0) {
      const children = flattenBlocs(bloc.childBlocs, bloc.finalName);
      flat.push(...children);
    }
  }
  return flat;
}

/**
 * Ensure all bloc names are unique by appending _1, _2, etc.
 */
function deduplicateNames(blocs) {
  const counts = {};
  // First pass: count occurrences
  for (const b of blocs) {
    counts[b.finalName] = (counts[b.finalName] || 0) + 1;
  }
  // Second pass: add suffixes where needed
  const seen = {};
  for (const b of blocs) {
    if (counts[b.finalName] > 1) {
      seen[b.finalName] = (seen[b.finalName] || 0) + 1;
      b.finalName = `${b.finalName}_${seen[b.finalName]}`;
    }
  }
}

/**
 * Ensure all element names within a bloc are unique
 */
function deduplicateElementNames(elements) {
  const counts = {};
  for (const e of elements) {
    const name = e.finalName || e.suggestedName;
    counts[name] = (counts[name] || 0) + 1;
  }
  const seen = {};
  for (const e of elements) {
    const name = e.finalName || e.suggestedName;
    e.finalName = name;
    if (counts[name] > 1) {
      seen[name] = (seen[name] || 0) + 1;
      e.finalName = `${name}_${seen[name]}`;
    }
  }
}

// ── Affichage inventaire ──────────────────────────────────────────────────────

function printInventory(allBlocs, orphanElements) {
  const line = '═'.repeat(70);
  const dash = '─'.repeat(50);

  console.log(`\n${line}`);
  console.log(`${C.bold}INVENTAIRE CMS (noms contextuels)${C.reset}`);
  console.log(line);

  // Blocs with their elements
  console.log(`\n${C.blue}${C.bold}■ BLOCS (${allBlocs.length})${C.reset}`);
  console.log(dash);

  for (let i = 0; i < allBlocs.length; i++) {
    const b = allBlocs[i];
    const cn = b.className ? ` ${C.dim}class="${b.className.slice(0, 40)}"${C.reset}` : '';
    const compTag = b.isComponent ? ` ${C.yellow}[composant]${C.reset}` : '';
    console.log(`  ${C.bold}${i + 1}. ${C.blue}<${b.tag}>${C.reset} → ${C.magenta}${b.finalName}${C.reset}${compTag}${cn}`);

    // Show elements belonging to this bloc
    if (b.elements.length > 0) {
      for (let j = 0; j < b.elements.length; j++) {
        const e = b.elements[j];
        const text = e.text ? ` "${e.text.slice(0, 30)}"` : '';
        const synth = e.synthetic ? ` ${C.dim}[auto]${C.reset}` : '';
        console.log(`     ${C.green}├─ ${j + 1}. <${e.tag}> → ${e.finalName}${C.reset} (${e.type})${synth}${C.dim}${text}${C.reset}`);
      }
    }
  }

  // Orphan elements
  if (orphanElements.length > 0) {
    console.log(`\n${C.green}${C.bold}● ÉLÉMENTS ORPHELINS (${orphanElements.length})${C.reset}`);
    console.log(dash);
    for (let i = 0; i < orphanElements.length; i++) {
      const e = orphanElements[i];
      const text = e.text ? ` "${e.text.slice(0, 40)}"` : '';
      console.log(`  ${i + 1}. ${C.green}<${e.tag}>${C.reset} → ${C.magenta}${e.finalName}${C.reset} (${e.type})${C.dim}${text}${C.reset}`);
    }
  }

  // Récapitulatif de TOUS les éléments
  const allElements = [];
  for (const b of allBlocs) {
    for (const e of b.elements) {
      allElements.push({ ...e, parentBloc: b.finalName });
    }
  }
  for (const e of orphanElements) {
    allElements.push({ ...e, parentBloc: '(orphelin)' });
  }

  if (allElements.length > 0) {
    console.log(`\n${C.green}${C.bold}● TOUS LES ÉLÉMENTS (${allElements.length})${C.reset}`);
    console.log(dash);
    for (let i = 0; i < allElements.length; i++) {
      const e = allElements[i];
      const text = e.text ? ` "${e.text.slice(0, 25)}"` : '';
      const synth = e.synthetic ? ` ${C.dim}[auto]${C.reset}` : '';
      console.log(`  ${i + 1}. ${C.green}${e.finalName}${C.reset} (${e.type}) ${C.dim}← ${e.parentBloc}${C.reset}${synth}${C.dim}${text}${C.reset}`);
    }
  }
}

// ── Mode interactif ───────────────────────────────────────────────────────────

function askQuestion(rl, question) {
  return new Promise(resolve => {
    rl.question(question, answer => resolve(answer.trim()));
  });
}

async function interactiveRename(allBlocs, orphanElements) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  console.log(`\n${'═'.repeat(70)}`);
  console.log(`${C.bold}${C.magenta}MODE INTERACTIF - Renommage des blocs et éléments${C.reset}`);
  console.log(`${C.dim}Appuyez sur Entrée pour garder le nom suggéré, ou tapez un nouveau nom.${C.reset}`);
  console.log(`${C.dim}Tapez "s" pour tout garder (skip), "q" pour quitter sans SQL.${C.reset}`);
  console.log('═'.repeat(70));

  // Rename blocs
  console.log(`\n${C.blue}${C.bold}■ BLOCS${C.reset}`);
  for (let i = 0; i < allBlocs.length; i++) {
    const b = allBlocs[i];
    const cn = b.className ? ` ${C.dim}(class: ${b.className.slice(0, 30)})${C.reset}` : '';
    const answer = await askQuestion(rl,
      `  ${i + 1}/${allBlocs.length} ${C.blue}<${b.tag}>${C.reset}${cn}\n    Nom [${C.magenta}${b.finalName}${C.reset}]: `
    );

    if (answer.toLowerCase() === 'q') {
      rl.close();
      return false;
    }
    if (answer.toLowerCase() === 's') break;
    if (answer) b.finalName = answer.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '');
  }

  // Rename elements per bloc
  console.log(`\n${C.green}${C.bold}● ÉLÉMENTS (par bloc)${C.reset}`);
  for (const b of allBlocs) {
    if (b.elements.length === 0) continue;

    console.log(`\n  ${C.blue}Bloc: ${b.finalName}${C.reset}`);
    for (let j = 0; j < b.elements.length; j++) {
      const e = b.elements[j];
      const text = e.text ? ` "${e.text.slice(0, 30)}"` : '';
      const answer = await askQuestion(rl,
        `    ${j + 1}/${b.elements.length} ${C.green}<${e.tag}>${C.reset} (${e.type})${C.dim}${text}${C.reset}\n      Nom [${C.magenta}${e.finalName}${C.reset}]: `
      );

      if (answer.toLowerCase() === 'q') {
        rl.close();
        return false;
      }
      if (answer.toLowerCase() === 's') break;
      if (answer) e.finalName = answer.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '');
    }
  }

  // Rename orphan elements
  if (orphanElements.length > 0) {
    console.log(`\n${C.green}${C.bold}● ÉLÉMENTS ORPHELINS${C.reset}`);
    for (let i = 0; i < orphanElements.length; i++) {
      const e = orphanElements[i];
      const text = e.text ? ` "${e.text.slice(0, 30)}"` : '';
      const answer = await askQuestion(rl,
        `  ${i + 1}/${orphanElements.length} ${C.green}<${e.tag}>${C.reset} (${e.type})${C.dim}${text}${C.reset}\n    Nom [${C.magenta}${e.finalName}${C.reset}]: `
      );

      if (answer.toLowerCase() === 'q') {
        rl.close();
        return false;
      }
      if (answer.toLowerCase() === 's') break;
      if (answer) e.finalName = answer.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '');
    }
  }

  rl.close();
  return true;
}

// ── Génération SQL ────────────────────────────────────────────────────────────

function generateSQL(allBlocs, orphanElements, pageName) {
  const line = '═'.repeat(70);
  const prefix = pageName.toUpperCase();

  // ── ÉTAPE 1 : Blocs uniquement ──────────────────────────────────────────────
  console.log(`\n${line}`);
  console.log(`${C.bold}SQL — ÉTAPE 1 : INSERTION DES BLOCS${C.reset}`);
  console.log(line);
  console.log(`\n${C.dim}-- ⚠ Remplacez @PageId par l'ID réel de la page "${pageName}"${C.reset}`);
  console.log(`${C.dim}-- Lancez d'abord cette requête, puis notez les IDs générés pour l'étape 2${C.reset}\n`);

  for (let i = 0; i < allBlocs.length; i++) {
    const b = allBlocs[i];
    const name = `${prefix}_${b.finalName}`.replace(/'/g, "''");
    const parentCode = b.parentBlockName ? `${prefix}_${b.parentBlockName}`.replace(/'/g, "''") : null;

    if (parentCode) {
      console.log(`INSERT INTO [sys_api_cms].[PageBlocks] (PageId, BlockCode, Title, LayoutRegion, SortOrder, IsReusable, Status, ParentBlockId)`);
      console.log(`VALUES (@PageId, '${name}', '${name}', 'main', ${i + 1}, 0, 'active', (SELECT BlockId FROM [sys_api_cms].[PageBlocks] WHERE BlockCode = '${parentCode}'));`);
    } else {
      console.log(`INSERT INTO [sys_api_cms].[PageBlocks] (PageId, BlockCode, Title, LayoutRegion, SortOrder, IsReusable, Status, ParentBlockId)`);
      console.log(`VALUES (@PageId, '${name}', '${name}', 'main', ${i + 1}, 0, 'active', NULL);`);
    }
  }

  // ── ÉTAPE 2 : Éléments par bloc ─────────────────────────────────────────────
  console.log(`\n${line}`);
  console.log(`${C.bold}SQL — ÉTAPE 2 : INSERTION DES ÉLÉMENTS${C.reset}`);
  console.log(line);
  console.log(`\n${C.dim}-- Les BlockId sont résolus automatiquement via le BlockCode du bloc parent${C.reset}\n`);

  for (let i = 0; i < allBlocs.length; i++) {
    const b = allBlocs[i];
    if (b.elements.length === 0) continue;

    const blockCode = `${prefix}_${b.finalName}`.replace(/'/g, "''");
    console.log(`${C.dim}-- Bloc: ${blockCode}${C.reset}`);
    for (let j = 0; j < b.elements.length; j++) {
      const e = b.elements[j];
      const ek = `${prefix}_${(e.finalName || e.suggestedName)}`.replace(/'/g, "''");
      console.log(`INSERT INTO [sys_api_cms].[BlockElements] (BlockId, ElementType, ElementKey, Content, IsActive, SortOrder)`);
      console.log(`VALUES ((SELECT BlockId FROM [sys_api_cms].[PageBlocks] WHERE BlockCode = '${blockCode}'), '${e.type}', '${ek}', NULL, 1, ${j + 1});`);
    }
    console.log('');
  }

  // Orphan elements
  if (orphanElements.length > 0) {
    console.log(`${C.dim}-- Éléments orphelins (sans bloc parent - à rattacher manuellement)${C.reset}`);
    for (let j = 0; j < orphanElements.length; j++) {
      const e = orphanElements[j];
      const ek = `${prefix}_${(e.finalName || e.suggestedName)}`.replace(/'/g, "''");
      console.log(`-- INSERT INTO [sys_api_cms].[BlockElements] (BlockId, ElementType, ElementKey, Content, IsActive, SortOrder)`);
      console.log(`-- VALUES (@BlockId_?, '${e.type}', '${ek}', NULL, 1, ${j + 1});`);
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
if (args.length === 0 || args.includes('--help')) {
  console.log(`${C.bold}Analyseur de page React/TSX → Inventaire CMS${C.reset}`);
  console.log(`\nUsage: node analyze-page.mjs <fichier.tsx> [--verbose] [--no-interactive]`);
  console.log(`\nOptions:`);
  console.log(`  --verbose         Afficher tous les noeuds (y compris SKIP)`);
  console.log(`  --no-interactive  Désactiver le mode interactif (garder les noms suggérés)`);
  console.log(`\nExemple:`);
  console.log(`  node analyze-page.mjs src/pages/Home.tsx`);
  console.log(`  node analyze-page.mjs src/pages/Home.tsx --no-interactive`);
  process.exit(0);
}

const filepath = resolve(args.filter(a => !a.startsWith('--'))[0]);
const verbose = args.includes('--verbose');
const interactive = !args.includes('--no-interactive');

if (!existsSync(filepath)) {
  console.error(`${C.red}Erreur: fichier introuvable: ${filepath}${C.reset}`);
  process.exit(1);
}

const content = readFileSync(filepath, 'utf-8');
const pageName = filepath.split(/[\\/]/).pop().replace(/\.\w+$/, '');
const sourceDir = dirname(filepath);

// Détecter la racine du projet (cherche package.json en remontant)
let projectRoot = sourceDir;
while (projectRoot !== dirname(projectRoot)) {
  if (existsSync(join(projectRoot, 'package.json'))) break;
  projectRoot = dirname(projectRoot);
}

// Extraire les imports pour résoudre les composants
const importMap = extractImports(content);
const componentCache = new Map(); // cache pour éviter de parser deux fois

// Résoudre les imports de données (camelCase) et peupler le cache
const dataImportMap = extractDataImports(content);
const resolvedDataFiles = new Set(); // éviter de parser un fichier deux fois
for (const [varName, importPath] of Object.entries(dataImportMap)) {
  const resolvedPath = resolveImportPath(importPath, sourceDir, projectRoot);
  if (!resolvedPath || resolvedDataFiles.has(resolvedPath)) continue;
  resolvedDataFiles.add(resolvedPath);

  const parsed = parseDataFile(resolvedPath);
  for (const [key, items] of Object.entries(parsed)) {
    if (items.length > 0) {
      dataArrayCache.set(key, items);
    }
  }
}
if (dataArrayCache.size > 0 && verbose) {
  console.log(`${C.dim}Données statiques résolues: ${[...dataArrayCache.keys()].join(', ')}${C.reset}`);
}

/**
 * Résout un composant par son nom, parse son fichier source,
 * et retourne les éléments de premier niveau.
 */
function resolveAndParseComponent(componentName, blockName) {
  // Check cache
  if (componentCache.has(componentName)) {
    const cached = componentCache.get(componentName);
    if (!cached) return null;
    // Re-generate element names with current blockName
    return componentNodesToElements(cached, blockName);
  }

  const importPath = importMap[componentName];
  if (!importPath) {
    componentCache.set(componentName, null);
    return null;
  }

  const resolvedPath = resolveImportPath(importPath, sourceDir, projectRoot);
  if (!resolvedPath) {
    componentCache.set(componentName, null);
    return null;
  }

  const nodes = parseComponentFile(resolvedPath);
  componentCache.set(componentName, nodes);

  if (!nodes || nodes.length === 0) return null;

  return componentNodesToElements(nodes, blockName);
}

console.log(`${C.bold}Analyse de: ${args.filter(a => !a.startsWith('--'))[0]}${C.reset}`);
console.log('═'.repeat(70) + '\n');

const jsx = extractJsxReturn(content);
const tree = parseJsx(jsx);

if (tree.length === 0) {
  console.log('Aucun JSX trouvé dans le fichier.');
  process.exit(1);
}

// 1. Skip le div/form container racine (c'est le wrapper de la page, pas un bloc métier)
let displayRoot = tree;
if (tree.length === 1 && /^(div|form)$/i.test(tree[0].tag) && tree[0].children.length > 0) {
  console.log(`${C.dim}(Container racine <${tree[0].tag}> ignoré — wrapper de la page)${C.reset}\n`);
  displayRoot = tree[0].children;
}

// 2. Arbre visuel
console.log(`${C.bold}ARBRE DES COMPOSANTS${C.reset}`);
console.log('─'.repeat(50));
printTree(displayRoot, 0, verbose);

// 3. Collecte inventaire avec noms contextuels
const { blocs, orphanElements, components } = collectInventory(displayRoot);
const allBlocs = flattenBlocs(blocs);

// Deduplicate names — on garde une map old→new pour corriger les parentBlockName
const nameBeforeDedup = allBlocs.map(b => b.finalName);
deduplicateNames(allBlocs);
// Construire la map des renommages pour les parents
const renameMap = {};
for (let i = 0; i < allBlocs.length; i++) {
  if (nameBeforeDedup[i] !== allBlocs[i].finalName) {
    renameMap[nameBeforeDedup[i]] = renameMap[nameBeforeDedup[i]] || [];
    renameMap[nameBeforeDedup[i]].push(allBlocs[i].finalName);
  }
}
// Corriger les parentBlockName après déduplication
for (const b of allBlocs) {
  if (b.parentBlockName && renameMap[b.parentBlockName]) {
    // Trouver le bon parent : celui qui est un ancêtre dans l'arbre original
    // On cherche le bloc parent le plus proche dans allBlocs qui précède ce bloc
    const idx = allBlocs.indexOf(b);
    for (let k = idx - 1; k >= 0; k--) {
      if (nameBeforeDedup[k] === b.parentBlockName) {
        b.parentBlockName = allBlocs[k].finalName;
        break;
      }
    }
  }
}
for (const b of allBlocs) {
  deduplicateElementNames(b.elements);
}
for (const e of orphanElements) {
  e.finalName = e.finalName || e.suggestedName;
}
deduplicateElementNames(orphanElements);

// 3. Afficher l'inventaire
printInventory(allBlocs, orphanElements);

// 4. Mode interactif ou direct
if (interactive && (allBlocs.length > 0 || orphanElements.length > 0)) {
  const proceed = await interactiveRename(allBlocs, orphanElements);
  if (!proceed) {
    console.log(`\n${C.yellow}Annulé. Aucun SQL généré.${C.reset}`);
    process.exit(0);
  }
}

// 5. Générer SQL
if (allBlocs.length > 0 || orphanElements.length > 0) {
  generateSQL(allBlocs, orphanElements, pageName);
}

console.log(`\n${C.dim}Tip: utilise --verbose pour voir tous les noeuds, --no-interactive pour skip le renommage${C.reset}`);
