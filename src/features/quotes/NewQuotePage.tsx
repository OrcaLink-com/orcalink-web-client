import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { RadioGroup, Radio } from '@heroui/react';
import { useCategories, useCreateQuote, useUploadQuota, queryKeys } from '../../lib/queries';
import { api } from '../../lib/api';
import { Button, Card, Input, PageHeader, Select, Textarea } from '../../components/ui';
import { IconClose, IconLocation, IconPlus, IconWarning } from '../../components/icons';

const MAX_IMAGES = 10;

export function NewQuotePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: categories, isLoading: loadingCategories } = useCategories();
  const createQuote = useCreateQuote();
  const quotaQ = useUploadQuota();

  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [budgetMode, setBudgetMode] = useState<'remote' | 'visit'>('remote');
  const [errors, setErrors] = useState<{ categoryId?: string; description?: string }>({});

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoBusy, setGeoBusy] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const remaining = quotaQ.data?.remaining ?? null;
  const resetsAt = quotaQ.data?.resetsAt ?? null;
  const quotaExhausted = remaining != null && remaining <= 0;
  const reachedMax = imageUrls.length >= MAX_IMAGES;
  const inputDisabled = uploading || quotaExhausted || reachedMax;

  function pickLocation() {
    if (!('geolocation' in navigator)) {
      setGeoError('Seu dispositivo não suporta geolocalização.');
      return;
    }
    setGeoBusy(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoBusy(false);
      },
      (err) => {
        setGeoError(err.message || 'Não foi possível obter sua localização.');
        setGeoBusy(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function onPickImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;
    setUploading(true);
    setUploadError(null);
    try {
      for (const file of files) {
        if (imageUrls.length >= MAX_IMAGES) break;
        const result = await api.uploadImage(file);
        setImageUrls((prev) => [...prev, result.url]);
        await qc.invalidateQueries({ queryKey: queryKeys.uploadQuota });
      }
    } catch (err) {
      setUploadError((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  function removeImage(url: string) {
    setImageUrls((prev) => prev.filter((u) => u !== url));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!categoryId) next.categoryId = 'Escolha uma categoria.';
    if (description.trim().length < 10) next.description = 'Descreva o serviço com pelo menos 10 caracteres.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const budgetReais = parseFloat(budgetMax.replace(/\./g, '').replace(',', '.'));
    const budgetMaxCents = Number.isFinite(budgetReais) && budgetReais > 0
      ? Math.round(budgetReais * 100)
      : undefined;

    await createQuote.mutateAsync({
      categoryId,
      description: description.trim(),
      zipCode: zipCode.trim() || undefined,
      requiresVisit: budgetMode === 'visit',
      budgetMaxCents,
      latitude: coords?.lat,
      longitude: coords?.lng,
      imageUrls: imageUrls.length ? imageUrls : undefined,
    });
    navigate('/');
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 pb-4">
      <PageHeader title="Novo orçamento" subtitle="Descreva o serviço e receba propostas." backTo="/" />

      <form onSubmit={onSubmit} className="space-y-5">
        <Select
          label="Categoria"
          placeholder="Selecione…"
          isDisabled={loadingCategories}
          options={(categories ?? []).map((c) => ({ value: c.id, label: c.name }))}
          value={categoryId}
          onChange={setCategoryId}
          error={errors.categoryId}
        />

        <Textarea
          label="Descrição do serviço"
          placeholder="Ex.: Preciso pintar dois quartos de aprox. 12m² cada…"
          value={description}
          onChange={setDescription}
          minRows={5}
          error={errors.description}
        />

        <div>
          <p className="mb-2 text-sm font-medium">Localização (opcional)</p>
          <Button
            variant={coords ? 'success' : 'secondary'}
            size="sm"
            onClick={pickLocation}
            disabled={geoBusy}
            startContent={<IconLocation size={16} />}
          >
            {geoBusy ? 'Obtendo…' : coords ? 'Localização capturada' : 'Usar minha localização'}
          </Button>
          {geoError && <p className="mt-1 text-xs text-danger">{geoError}</p>}
          {coords && (
            <p className="mt-1 text-xs text-text-muted">
              {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
            </p>
          )}
        </div>

        <Input label="CEP (opcional)" placeholder="01001-000" value={zipCode} onChange={setZipCode} />

        <Input
          label="Orçamento máximo (opcional)"
          placeholder="Ex.: 1.500,00"
          value={budgetMax}
          onChange={setBudgetMax}
          startContent={<span className="text-sm text-text-muted">R$</span>}
        />

        <div>
          <p className="mb-2 text-sm font-medium">Como prefere orçar?</p>
          <RadioGroup value={budgetMode} onValueChange={(v) => setBudgetMode(v as 'remote' | 'visit')}>
            <Card className="p-0">
              <Radio
                value="remote"
                description="O profissional pode orçar pelas fotos e descrição."
                classNames={{ base: 'm-0 max-w-none p-3.5' }}
              >
                À distância (mais rápido)
              </Radio>
            </Card>
            <Card className="mt-2 p-0">
              <Radio
                value="visit"
                description="Receba propostas só de quem for até o local. Você pode mudar depois."
                classNames={{ base: 'm-0 max-w-none p-3.5' }}
              >
                Com visita técnica antes
              </Radio>
            </Card>
          </RadioGroup>
        </div>

        {/* Imagens (várias, limite de 5/hora) */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">
              Fotos (opcional) · {imageUrls.length}/{MAX_IMAGES}
            </p>
            {remaining != null && (
              <span
                className={`inline-flex items-center gap-1 text-xs ${quotaExhausted ? 'text-warning' : 'text-text-muted'}`}
              >
                {quotaExhausted && <IconWarning size={13} />}
                {quotaExhausted ? 'Limite de envios atingido' : `Pode enviar mais ${remaining} nesta hora`}
              </span>
            )}
          </div>

          {imageUrls.length > 0 && (
            <div className="mb-2 grid grid-cols-4 gap-2">
              {imageUrls.map((url) => (
                <div key={url} className="relative">
                  <img src={url} alt="" className="aspect-square w-full rounded-medium object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-white"
                    aria-label="Remover imagem"
                  >
                    <IconClose size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <label
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-large border border-dashed border-border py-5 text-sm text-text-muted ${
              inputDisabled ? 'cursor-not-allowed opacity-50' : 'hover:border-primary hover:text-foreground'
            }`}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onPickImages}
              disabled={inputDisabled}
              className="hidden"
            />
            {!inputDisabled && <IconPlus size={16} />}
            {uploading
              ? 'Enviando…'
              : reachedMax
                ? `Máximo de ${MAX_IMAGES} imagens`
                : quotaExhausted
                  ? `Limite por hora atingido${resetsAt ? ` — libera às ${new Date(resetsAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : ''}`
                  : 'Adicionar fotos'}
          </label>
          {uploadError && <p className="mt-1 text-xs text-danger">{uploadError}</p>}
        </div>

        {createQuote.isError && (
          <p className="text-sm text-danger">{(createQuote.error as Error).message}</p>
        )}

        <Button type="submit" full loading={createQuote.isPending} disabled={uploading}>
          Solicitar orçamento
        </Button>
      </form>
    </div>
  );
}
