const blocks = document.querySelectorAll('.block');
const canvas = document.getElementById('canvas');
const copyBtn = document.getElementById('copyBtn');

blocks.forEach(block => {
  block.addEventListener('dragstart', e => {
    e.dataTransfer.setData('text/plain', block.textContent);
  });
});

canvas.addEventListener('dragover', e => {
  e.preventDefault();
});

canvas.addEventListener('drop', e => {
  e.preventDefault();
  const text = e.dataTransfer.getData('text/plain');
  const div = document.createElement('div');
  div.textContent = text;
  div.contentEditable = true;
  div.style.border = '1px solid black';
  div.style.margin = '5px 0';
  div.style.padding = '5px';
  canvas.appendChild(div);
});

copyBtn.addEventListener('click', () => {
  let emailText = '';
  canvas.querySelectorAll('div').forEach(div => {
    emailText += div.textContent + '\n';
  });
  navigator.clipboard.writeText(emailText);
  alert('E-mail gekopieerd naar clipboard!');
});
