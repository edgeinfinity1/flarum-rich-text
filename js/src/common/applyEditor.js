import { extend, override } from 'flarum/common/extend';

import Button from 'flarum/common/components/Button';
import TextEditor from 'flarum/common/components/TextEditor';
import Tooltip from 'flarum/common/components/Tooltip';
import classList from 'flarum/common/utils/classList';

import ProseMirrorEditorDriver from './proseMirror/ProseMirrorEditorDriver';
import ProseMirrorMenu from './components/ProseMirrorMenu';
import MenuState from './states/MenuState';

export default function applyEditor() {
  extend(TextEditor.prototype, 'oninit', function () {
    // 在实例初始化时设置状态
    this.useRichTextEditor = app.session.user ? app.session.user.preferences().useRichTextEditor : true;
  });

  extend(TextEditor.prototype, 'controlItems', function (items) {
    if (!app.forum.attribute('toggleRichTextEditorButton')) return;

    const buttonOnClick = () => {
      this.useRichTextEditor = !app.session.user.preferences().useRichTextEditor;

      console.log('Destroying old composer');
      app.composer.editor.destroy();
      console.log('Old composer destroyed');
      this.attrs.composer.editor = this.buildEditor(this.$('.TextEditor-editorContainer')[0]);

      app.session.user.savePreferences({ useRichTextEditor: !app.session.user.preferences().useRichTextEditor }).then(() => {
        m.redraw.sync();
        app.composer.editor.focus();
        console.log(app.composer.editor);
      });
    };

    items.add(
      'rich-text',
      <Tooltip text={app.translator.trans('askvortsov-rich-text.lib.composer.toggle_button')}>
        <Button
          icon="fas fa-pen-fancy"
          className={classList({ Button: true, 'Button--icon': true, active: this.useRichTextEditor })}
          onclick={buttonOnClick}
        />
      </Tooltip>,
      -10
    );
  });

  extend(TextEditor.prototype, 'toolbarItems', function (items) {
    if (!this.useRichTextEditor) return;

    items.remove('markdown');

    items.add('prosemirror-menu', <ProseMirrorMenu state={this.menuState} />, 100);
  });

  extend(TextEditor.prototype, 'buildEditorParams', function (items) {
    if (!this.useRichTextEditor) return;

    items.menuState = this.menuState = new MenuState();
    items.classNames.push('Post-body');
    items.escape = () => app.composer.close();
    m.redraw();
  });

  override(TextEditor.prototype, 'buildEditor', function (original, dom) {
    if (this.useRichTextEditor) {
      return new ProseMirrorEditorDriver(dom, this.buildEditorParams());
    }

    return original(dom);
  });
}
