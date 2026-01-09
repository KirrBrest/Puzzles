import { InputFieldResult } from '../types';

export default function createInputField(
  id: string,
  labelText: string,
  required: boolean
): InputFieldResult {
  const fieldContainer = document.createElement('div');
  fieldContainer.className = 'input-field';

  const label = document.createElement('label');
  label.setAttribute('for', id);
  label.className = 'input-label';
  label.textContent = labelText;
  fieldContainer.appendChild(label);

  const input = document.createElement('input');
  input.type = 'text';
  input.id = id;
  input.name = id;
  input.className = 'input-control';
  input.required = required;
  input.setAttribute('autocomplete', 'off');

  fieldContainer.appendChild(input);

  const errorMessage = document.createElement('span');
  errorMessage.className = 'input-error';
  errorMessage.setAttribute('role', 'alert');
  errorMessage.setAttribute('aria-live', 'polite');
  fieldContainer.appendChild(errorMessage);

  return { container: fieldContainer, input, errorMessage };
}
