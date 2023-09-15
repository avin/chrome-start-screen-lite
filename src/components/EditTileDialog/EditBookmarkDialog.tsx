import { Component, JSX, createSignal } from 'solid-js';
import Dialog from '../Dialog/Dialog';
import Input from '../Input/Input';
import InputContainer from '../InputContainer/InputContainer';

interface FormData {
  title: string;
  url: string;
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

  return (
    <Dialog
      title={props.title}
      buttons={[
        {
          label: 'Отмена',
          onClick: () => {
            props.onClose();
          },
        },
        {
          label: 'Готово',
          onClick: () => {
            handleSubmit();
          },
          disabled: !isFormValid(),
        },
      ]}
    >
      <form>
        <InputContainer label="Название">
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
            onInput={(e) => {
              setFormValues((f) => ({ ...f, url: e.target.value }));
            }}
          />
        </InputContainer>

        <input type="submit" hidden />
      </form>
    </Dialog>
  );
};

export default EditBookmarkDialog;
