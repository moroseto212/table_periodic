import { useEffect, useMemo, useRef, type MouseEvent } from 'react';
import { elements } from '../../core/data/elements';
import {
  buildGuidePages,
  type GuideElement,
  type GuideLink,
  type GuidePage,
} from '../../content/guides';
import { navigate, withBase } from '../../app/router';

/** Tautan internal yang tetap bisa dibuka di tab baru, tetapi memakai router SPA. */
function SmartLink({
  path,
  children,
  ...rest
}: {
  path: string;
  children: React.ReactNode;
  'aria-current'?: 'page';
}) {
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(path);
  };

  return (
    <a href={withBase(path)} onClick={onClick} {...rest}>
      {children}
    </a>
  );
}

function AppLink({ item }: { item: GuideLink }) {
  return (
    <li>
      <SmartLink path={item.path}>{item.label}</SmartLink>
      {item.hint ? <span>{item.hint}</span> : null}
    </li>
  );
}

function GuideArticle({ page }: { page: GuidePage }) {
  return (
    <>
      {page.breadcrumb.length > 0 ? (
        <nav className="seo__crumbs" aria-label="Breadcrumb">
          <ol>
            {page.breadcrumb.map((crumb, index) => {
              const last = index === page.breadcrumb.length - 1;
              return (
                <li key={`${crumb.path}-${crumb.name}`}>
                  {last ? (
                    <span aria-current="page">{crumb.name}</span>
                  ) : (
                    <SmartLink path={crumb.path}>{crumb.name}</SmartLink>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      ) : null}

      <h1>{page.heading}</h1>
      {page.intro.map((paragraph) => (
        <p key={paragraph.slice(0, 48)}>{paragraph}</p>
      ))}

      {page.facts?.length ? (
        <dl className="seo__facts">
          {page.facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {page.sections?.map((section) => (
        <section className="seo__section" key={section.heading}>
          <h2>{section.heading}</h2>
          {section.paragraphs?.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
          {section.items?.length ? (
            <dl className="seo__facts">
              {section.items.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {section.list?.length ? (
            <ul className="seo__links">
              {section.list.map((item) => (
                <AppLink item={item} key={`${item.path}-${item.label}`} />
              ))}
            </ul>
          ) : null}
        </section>
      ))}

      {page.faq?.length ? (
        <section className="seo__faq">
          <h2>Tanya jawab</h2>
          {page.faq.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </section>
      ) : null}

      {page.groups?.map((group) => (
        <section className="seo__group" key={group.heading}>
          <h2>{group.heading}</h2>
          <ul>
            {group.items.map((item) => (
              <AppLink item={item} key={`${item.path}-${item.label}`} />
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}

export default function GuideScreen({ path }: { path: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const page = useMemo(() => {
    const pages = buildGuidePages(elements as unknown as GuideElement[], '');
    return pages.find((item) => item.path === path) ?? null;
  }, [path]);

  useEffect(() => {
    if (!page) return;
    document.title = page.title;
    const tag = document.querySelector('meta[name="description"]');
    if (tag) tag.setAttribute('content', page.description);
  }, [page]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [path]);

  if (!page) {
    return (
      <div className="empty-route">
        <h1>Halaman tidak ditemukan</h1>
        <button type="button" className="btn btn--primary" onClick={() => navigate('/')}>
          Kembali ke tabel
        </button>
      </div>
    );
  }

  return (
    <div className="guide" ref={scrollRef}>
      <article className="guide__article">
        <GuideArticle page={page} />
      </article>
    </div>
  );
}
