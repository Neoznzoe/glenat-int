import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { useAnnonceEmetteur } from '@/hooks/useAnnonces';
import { format, addMonths } from 'date-fns';
import { Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface DeposerAnnonceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface FilePreview {
  file: File;
  previewUrl?: string;
}

const CATEGORIES = ['Véhicules', 'Immobilier', 'Multimédia', 'Maison', 'Loisir', 'Autre'] as const;
const TYPES = ['Actualité', 'Offre', 'Demande'] as const;

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 Mo
const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10 Mo
const ACCEPTED_IMAGES = '.jpg,.jpeg';
const ACCEPTED_ATTACHMENTS = '.pdf,.xlsx,.xls,.doc,.docx';

export function DeposerAnnonceDialog({ open, onOpenChange, onSuccess }: DeposerAnnonceDialogProps) {
  const { user } = useAuth();
  const userEmail = user?.mail ?? user?.userPrincipalName;
  const { data: emetteur, isLoading: loadingEmetteur } = useAnnonceEmetteur(open ? userEmail : undefined);
  const [submitting, setSubmitting] = useState(false);

  // Fallback: Microsoft Graph profile si l'API emetteur n'est pas dispo
  const userProfile = useMemo(() => {
    if (emetteur) {
      return {
        lastName: emetteur.lastName,
        firstName: emetteur.firstName,
        company: emetteur.company,
        department: emetteur.department,
      };
    }
    if (!user) return null;
    return {
      lastName: user.surname ?? '',
      firstName: user.givenName ?? '',
      company: '',
      department: '',
    };
  }, [user, emetteur]);

  // Form state
  const [title, setTitle] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState<FilePreview[]>([]);
  const [attachments, setAttachments] = useState<FilePreview[]>([]);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  // Max date: 3 months from now
  const maxDate = useMemo(() => format(addMonths(new Date(), 3), 'yyyy-MM-dd'), []);
  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);

  // Reset form on open
  useEffect(() => {
    if (open) {
      setTitle('');
      setExpiresAt('');
      setDescription('');
      setType('');
      setCategory('');
      setPrice('');
      setImages([]);
      setAttachments([]);
    }
  }, [open]);

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remaining = 3 - images.length;
    const newFiles: FilePreview[] = [];

    for (let i = 0; i < Math.min(files.length, remaining); i++) {
      const file = files[i]!;
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(`${file.name} dépasse 5 Mo.`);
        continue;
      }
      newFiles.push({ file, previewUrl: URL.createObjectURL(file) });
    }

    setImages((prev) => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const handleAttachmentAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remaining = 2 - attachments.length;
    const newFiles: FilePreview[] = [];

    for (let i = 0; i < Math.min(files.length, remaining); i++) {
      const file = files[i]!;
      if (file.size > MAX_ATTACHMENT_SIZE) {
        toast.error(`${file.name} dépasse 10 Mo.`);
        continue;
      }
      newFiles.push({ file });
    }

    setAttachments((prev) => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const removed = prev[index];
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const isValid = title.trim() && expiresAt && description.trim() && type;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !userProfile) return;

    setSubmitting(true);
    try {
      // TODO: Appel API POST /annonces quand l'endpoint sera prêt
      // Pour l'instant on simule
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Annonce déposée avec succès', {
        description: 'Elle sera visible après validation par le webmaster.',
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      toast.error("Erreur lors du dépôt de l'annonce.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Déposer une annonce</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Les petites annonces sont soumises à la modération du webmaster. Durée maximum 3 mois.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Émetteur (read-only) */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Émetteur
            </h3>
            {loadingEmetteur && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Chargement du profil...
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <Label className="text-xs text-muted-foreground">Nom</Label>
                <p className="font-medium">{userProfile?.lastName || '—'}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Prénom</Label>
                <p className="font-medium">{userProfile?.firstName || '—'}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Société</Label>
                <p className="font-medium">{userProfile?.company || '—'}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Service</Label>
                <p className="font-medium">{userProfile?.department || '—'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Stepper workflow */}
          <div className="flex items-stretch text-xs rounded-md overflow-hidden border border-border">
            {/* Étape 1 — active */}
            <div className="flex-1 flex items-center gap-2 bg-primary text-primary-foreground px-3 py-2.5 relative">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground text-primary text-[10px] font-bold shrink-0">
                1
              </span>
              <div className="leading-tight">
                <p className="font-semibold">Saisie de l'annonce</p>
                <p className="opacity-80">Par {userProfile?.firstName} {userProfile?.lastName}</p>
              </div>
              {/* Flèche */}
              <div className="absolute -right-2 top-0 bottom-0 w-4 z-10">
                <svg viewBox="0 0 16 40" className="h-full w-full" preserveAspectRatio="none">
                  <polygon points="0,0 12,20 0,40" className="fill-primary" />
                </svg>
              </div>
            </div>
            {/* Étape 2 — inactive */}
            <div className="flex-1 flex items-center gap-2 bg-zinc-100 text-zinc-400 px-4 py-2.5 relative">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-zinc-300 text-[10px] font-bold shrink-0">
                2
              </span>
              <div className="leading-tight">
                <p className="font-semibold">Validation de l'annonce</p>
                <p>par le webmaster</p>
              </div>
              <div className="absolute -right-2 top-0 bottom-0 w-4 z-10">
                <svg viewBox="0 0 16 40" className="h-full w-full" preserveAspectRatio="none">
                  <polygon points="0,0 12,20 0,40" className="fill-zinc-100" />
                </svg>
              </div>
            </div>
            {/* Étape 3 — inactive */}
            <div className="flex-1 flex items-center justify-center gap-2 bg-zinc-50 text-zinc-400 px-4 py-2.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-zinc-300 text-[10px] font-bold shrink-0">
                3
              </span>
              <p className="font-semibold">Terminé</p>
            </div>
          </div>

          {/* Titre */}
          <div className="space-y-1.5">
            <Label htmlFor="annonce-title">
              Titre de l'annonce <span className="text-destructive">*</span>
            </Label>
            <Input
              id="annonce-title"
              placeholder="Ex: Appartement F3 à vendre"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
          </div>

          {/* Date de fin d'affichage */}
          <div className="space-y-1.5">
            <Label htmlFor="annonce-expires">
              Date de fin d'affichage <span className="text-destructive">*</span>
            </Label>
            <p className="text-xs text-muted-foreground">Limitée à 3 mois</p>
            <Input
              id="annonce-expires"
              type="date"
              min={today}
              max={maxDate}
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>

          {/* Texte de l'annonce */}
          <div className="space-y-1.5">
            <Label htmlFor="annonce-description">
              Texte de l'annonce <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="annonce-description"
              placeholder="Décrivez votre annonce..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />
          </div>

          {/* Type d'annonce */}
          <div className="space-y-2">
            <Label>
              Type d'annonce <span className="text-destructive">*</span>
            </Label>
            <RadioGroup value={type} onValueChange={setType} className="flex gap-6">
              {TYPES.map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <RadioGroupItem value={t} id={`type-${t}`} />
                  <Label htmlFor={`type-${t}`} className="font-normal cursor-pointer">
                    {t}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Catégorie */}
          <div className="space-y-1.5">
            <Label>Catégorie</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez dans la liste" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prix */}
          <div className="space-y-1.5">
            <Label htmlFor="annonce-price">Prix</Label>
            <Input
              id="annonce-price"
              placeholder="Ex: 150 €, Gratuit, À négocier..."
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <Separator />

          {/* Images */}
          <div className="space-y-2">
            <Label>Images ({images.length}/3)</Label>
            <p className="text-xs text-muted-foreground">
              Le fichier doit être une image .jpg (RVB sans profil). Max 5 Mo.
            </p>
            <div className="flex gap-3 flex-wrap">
              {images.map((img, i) => (
                <div key={i} className="relative h-20 w-20 rounded border overflow-hidden group">
                  <img src={img.previewUrl} alt={`Image ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {images.length < 3 && (
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="h-20 w-20 rounded border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <Upload className="h-5 w-5" />
                </button>
              )}
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept={ACCEPTED_IMAGES}
              className="hidden"
              onChange={handleImageAdd}
            />
          </div>

          {/* Pièces jointes */}
          <div className="space-y-2">
            <Label>Pièces jointes ({attachments.length}/2)</Label>
            <p className="text-xs text-muted-foreground">
              Formats acceptés : .pdf, .xlsx, .doc, .docx. Max 10 Mo.
            </p>
            <div className="space-y-2">
              {attachments.map((att, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="truncate flex-1">{att.file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {(att.file.size / 1024 / 1024).toFixed(1)} Mo
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(i)}
                    className="h-5 w-5 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {attachments.length < 2 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => attachmentInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Ajouter une pièce jointe
                </Button>
              )}
            </div>
            <input
              ref={attachmentInputRef}
              type="file"
              accept={ACCEPTED_ATTACHMENTS}
              className="hidden"
              onChange={handleAttachmentAdd}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={!isValid || submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Envoyer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default DeposerAnnonceDialog;
