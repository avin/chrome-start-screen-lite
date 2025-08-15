import { Component, JSX, Show, createSignal } from 'solid-js';
import Dialog from '../Dialog/Dialog';
import Input from '../Input/Input';
import InputContainer from '../InputContainer/InputContainer';
import Button from '../Button/Button';
import { resizeImageFileToDataURL } from '../../utils/image';

interface FormData {
  title: string;
  url: string;
  iconDataUrl?: string;
}

const EditBookmarkDialog: Component<{
  title: JSX.Element;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  initialValues?: Partial<FormData>;
}> = (props) => {
  const [formValues, setFormValues] = createSignal({
    title: '',
    url: '',
    ...props.initialValues,
  });

  const handleSubmit = () => {
    props.onSubmit(formValues());
  };

  const isFormValid = () => {
    return !!formValues().title && !!formValues().url;
  };

  const handleIconFileChange: JSX.EventHandler<HTMLInputElement, Event> = async (e) => {
    const input = e.currentTarget;
    const file = input.files && input.files[0];
    if (!file) return;
    try {
      const dataUrl = await resizeImageFileToDataURL(file, 64, 'image/png');
      setFormValues((f) => ({ ...f, iconDataUrl: dataUrl }));
    } catch (err) {
      // Silently ignore errors; could add toast/logging later
      console.error(err);
    } finally {
      // reset the input so selecting the same file again re-triggers change
      input.value = '';
    }
  };

  let fileInputRef: HTMLInputElement | undefined;

  const openFileDialog = () => {
    fileInputRef?.click();
  };

  return (
    <Dialog
      title={props.title}
      buttons={[
        {
          label: chrome.i18n.getMessage('cancel'),
          onClick: () => {
            props.onClose();
          },
        },
        {
          label: chrome.i18n.getMessage('done'),
          submit: true,
          onClick: () => {
            handleSubmit();
          },
          disabled: !isFormValid(),
        },
      ]}
    >
      <InputContainer label={chrome.i18n.getMessage('title')}>
        <Input
          name="title"
          value={formValues().title}
          onInput={(e) => {
            setFormValues((f) => ({ ...f, title: e.target.value }));
          }}
        />
      </InputContainer>

      <InputContainer label="URL">
        <Input
          name="url"
          value={formValues().url}
          placeholder="https://"
          onInput={(e) => {
            setFormValues((f) => ({ ...f, url: e.target.value }));
          }}
        />
      </InputContainer>

      <InputContainer label={chrome.i18n.getMessage('icon')}>
        <div style={{ display: 'flex', 'align-items': 'center', gap: '12px' }}>
          <Show when={!!formValues().iconDataUrl}>

              <img
                src={formValues().iconDataUrl}
                alt="icon preview"
                width={32}
                height={32}
                style={{ display: 'block' }}
              />

          </Show>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button onClick={openFileDialog}>{chrome.i18n.getMessage('chooseIcon')}</Button>
            <Show when={formValues().iconDataUrl}>
              <Button onClick={() => setFormValues((f) => ({ ...f, iconDataUrl: undefined }))}>{chrome.i18n.getMessage('removeIcon')}</Button>
            </Show>
          </div>

          <input
            ref={(el) => (fileInputRef = el)}
            type="file"
            accept="image/*"
            onChange={handleIconFileChange}
            style={{ display: 'none' }}
          />
        </div>
      </InputContainer>
    </Dialog>
  );
};

export default EditBookmarkDialog;
