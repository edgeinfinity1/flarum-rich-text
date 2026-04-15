import { Plugin } from 'prosemirror-state';

export default function disableImagePastePlugin() {
  return new Plugin({
    props: {
      transformPastedHTML(html) {
        const doc = new DOMParser().parseFromString(html, 'text/html');

        doc.querySelectorAll('img').forEach((img) => img.remove());

        return doc.body.innerHTML;
      },
    },
  });
}
