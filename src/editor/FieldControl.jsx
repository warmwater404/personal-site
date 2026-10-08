import { useId } from "react";

/* ============================================================================
 *  字段控件
 *  ---------------------------------------------------------------------------
 *  根据字段定义（schemas.js）自动渲染出对应的输入控件。
 *  支持递归：items 里的子字段可以是 items，用来做「分组 → 链接」这种两层结构。
 * ==========================================================================*/

function moveAt(list, index, delta) {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const next = list.slice();
  const [moved] = next.splice(index, 1);
  next.splice(target, 0, moved);
  return next;
}

/* -------------------------------------------------------------- 一组短文本 */

function StringsField({ field, value, onChange }) {
  const items = Array.isArray(value) ? value : [];
  const blank = field.blank === undefined ? "" : field.blank;

  return (
    <div className="field field--group">
      <div className="field__head">
        <span className="field__label">{field.label}</span>
        <button type="button" className="mini-btn" onClick={() => onChange([...items, blank])}>
          ＋ 添加一条
        </button>
      </div>

      {items.length === 0 ? (
        <p className="field__empty">还没有内容，点右上角添加。</p>
      ) : (
        <div className="string-list">
          {items.map((item, index) => (
            <div className="string-row" key={index}>
              <input
                className="field__input"
                type="text"
                value={item ?? ""}
                onChange={(event) =>
                  onChange(items.map((entry, i) => (i === index ? event.target.value : entry)))
                }
              />
              <button
                type="button"
                className="mini-btn"
                title="上移"
                disabled={index === 0}
                onClick={() => onChange(moveAt(items, index, -1))}
              >
                ↑
              </button>
              <button
                type="button"
                className="mini-btn"
                title="下移"
                disabled={index === items.length - 1}
                onClick={() => onChange(moveAt(items, index, 1))}
              >
                ↓
              </button>
              <button
                type="button"
                className="mini-btn mini-btn--danger"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
              >
                删除
              </button>
            </div>
          ))}
        </div>
      )}

      {field.hint ? <p className="field__hint">{field.hint}</p> : null}
    </div>
  );
}

/* -------------------------------------------------------------- 一组对象 */

function ItemsField({ field, value, onChange }) {
  const items = Array.isArray(value) ? value : [];
  const itemLabel = field.itemLabel || "条目";

  const addItem = () => {
    const blank = field.blank ? JSON.parse(JSON.stringify(field.blank)) : {};
    onChange([...items, blank]);
  };

  const removeItem = (index) => {
    if (window.confirm(`确定删除这个${itemLabel}吗？`)) {
      onChange(items.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="field field--group">
      <div className="field__head">
        <span className="field__label">{field.label}</span>
        <button type="button" className="mini-btn" onClick={addItem}>
          ＋ 添加{itemLabel}
        </button>
      </div>

      {items.length === 0 ? (
        <p className="field__empty">还没有内容，点右上角添加。</p>
      ) : (
        <div className="item-stack">
          {items.map((item, index) => (
            <div className="item-card" key={index}>
              <div className="item-card__bar">
                <span className="item-card__title">
                  {field.titleKey && item[field.titleKey]
                    ? item[field.titleKey]
                    : `${itemLabel} ${index + 1}`}
                </span>
                <span className="item-card__actions">
                  <button
                    type="button"
                    className="mini-btn"
                    title="上移"
                    disabled={index === 0}
                    onClick={() => onChange(moveAt(items, index, -1))}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="mini-btn"
                    title="下移"
                    disabled={index === items.length - 1}
                    onClick={() => onChange(moveAt(items, index, 1))}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="mini-btn mini-btn--danger"
                    onClick={() => removeItem(index)}
                  >
                    删除
                  </button>
                </span>
              </div>

              <div className="item-card__body">
                {(field.fields || []).map((sub) => (
                  <FieldControl
                    key={sub.key}
                    field={sub}
                    value={item[sub.key]}
                    onChange={(next) => {
                      onChange(items.map((entry, i) => (i === index ? { ...entry, [sub.key]: next } : entry)));
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ 入口 */

export default function FieldControl({ field, value, onChange }) {
  const uid = useId();

  if (field.type === "items") {
    return <ItemsField field={field} value={value} onChange={onChange} />;
  }

  if (field.type === "strings") {
    return <StringsField field={field} value={value} onChange={onChange} />;
  }

  if (field.type === "textarea") {
    return (
      <div className="field">
        <label className="field__label" htmlFor={uid}>
          {field.label}
        </label>
        <textarea
          id={uid}
          className="field__input field__input--area"
          rows={field.rows || 4}
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
        />
        {field.hint ? <p className="field__hint">{field.hint}</p> : null}
      </div>
    );
  }

  return (
    <div className="field">
      <label className="field__label" htmlFor={uid}>
        {field.label}
      </label>
      <input
        id={uid}
        className="field__input"
        type="text"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
      />
      {field.hint ? <p className="field__hint">{field.hint}</p> : null}
    </div>
  );
}
