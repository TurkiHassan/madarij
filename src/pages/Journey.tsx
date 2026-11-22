import React, { useLayoutEffect, useRef } from 'react'
import { go } from '../router'
import { initJourney, type EngineCtl, type EngineHandle } from '../journey/engine'
import '../styles/journey.css'

/* ============================================================
   مدارج — صفحة الرحلة: مسرح مثبت واحد يحركه التمرير
   (نقل بنية index.html المرجعية: طبقات نص فوق مشهد ثلاثي
   الأبعاد، إطار واجهة ثابت، سكة مراحل، محمل، وبديل نصي)
   ============================================================ */
export function Journey() {
  const rootRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    document.body.classList.add('jr-on')
    // تجربة سينمائية خطية: تعطّل استرجاع التمرير كيلا يسبق المتصفحُ قياسات المسرح
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    scrollTo(0, 0)
    let handle: EngineHandle | undefined
    const ctl: EngineCtl = { cancelled: false }
    initJourney(ctl).then((h) => {
      if (ctl.cancelled) h.destroy()
      else handle = h
    })
    return () => {
      ctl.cancelled = true
      handle?.destroy()
      document.body.classList.remove('jr-on')
      if ('scrollRestoration' in history) history.scrollRestoration = 'auto'
    }
  }, [])

  return (
    <div className="jr" ref={rootRef}>
      <div id="jr-track">
        <div id="jr-stage">
          <div id="jr-gl-host" />
          <div id="jr-overlay">
            {/* البطل */}
            <section className="ov jr-hero" id="ovHero">
              <h1>
                الخطة تبدأ
                <br />
                <span className="jr-hero-accent">من الطفل.</span>
              </h1>
              <p>
                هدفٌ من كلماته، ونشاطٌ من اهتمامه، ومسبارٌ أسبوعي يخبرك هل الطريق يعمل.
                <br />
                كل ذلك في ملف واحد، بلا أوراق ضائعة.
              </p>
            </section>

            {/* الفكرة */}
            <section className="ov" id="ovAbout">
              <h2>ملف واحد، بلا أوراق ضائعة.</h2>
              <p>
                مدارج يجمع الهدف الفردي، والخطة، والنشاط، والمسبار، والتقرير في مكان واحد —
                مبنيًا مع معلم صعوبات التعلم، لا حوله.
              </p>
            </section>

            {/* الدورة */}
            <section className="ov ttl" id="ovCycle">
              <span className="pill">
                <span className="grad">دورة واحدة تتكرر كل أسبوع</span>
              </span>
            </section>

            {/* حروف العربية */}
            <section className="ov ttl" id="ovArabic">
              <h2>
                <span>العربية</span> ليست ترجمة.
              </h2>
            </section>

            {/* شاشات المنصة */}
            <section className="ov ttl" id="ovG-plan">
              <span className="pill">
                <span className="grad">الخطة الفردية</span>
              </span>
            </section>
            <section className="ov ttl" id="ovG-probe">
              <span className="pill">
                <span className="grad">المسبار الأسبوعي</span>
              </span>
            </section>
            <section className="ov ttl" id="ovG-activity">
              <span className="pill">
                <span className="grad">أنشطة من خمس دقائق</span>
              </span>
            </section>
            <section className="ov ttl" id="ovG-report">
              <span className="pill">
                <span className="grad">تقارير الأسرة</span>
              </span>
            </section>
            <section className="ov ttl" id="ovG-standards">
              <span className="pill">
                <span className="grad">مكتبة المعايير</span>
              </span>
            </section>
            <section className="ov ttl" id="ovG-file">
              <span className="pill">
                <span className="grad">ملف الطالب</span>
              </span>
            </section>

            {/* الختام */}
            <section className="ov" id="ovFinal">
              <h2>كل طفل يستحق خطة تُرى.</h2>
              <div className="final-actions">
                <button id="jr-cta" type="button" onClick={() => go('/app')}>
                  <span>افتح النموذج التجريبي</span>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                    <path d="M4 12L12 4M5.5 4H12v6.5" />
                  </svg>
                </button>
                <button id="jr-cta2" type="button" onClick={() => go('/app/guide')}>
                  دليل العرض
                </button>
              </div>
              <small>© ٢٠٢٦ مدارج — نموذج تجريبي، البيانات المعروضة وهمية</small>
            </section>
          </div>
        </div>
      </div>

      {/* بديل نصي لما يُرسم في المشهد ثلاثي الأبعاد */}
      <div className="sr">
        <h2>دورة الأسبوع في مدارج</h2>
        <p>الهدف، الخطة، النشاط، المسبار، التقرير — خمس خطوات تُنتج أثرًا قابلًا للقياس.</p>
        <p>٤٤+ معيارًا من دليل الوزارة، ٦٠ ثانية لكل مسبار، ٥ خطوات أسبوعية، تقرير واحد جاهز للأسرة.</p>
        <h2>حروف العربية</h2>
        <p>ب ت ث، ة ه، بَ بُ بِ، ال، د ذ، س ش، ض ظ، غ ع، ق ف، ن م، ر ز، ج ح خ — تمارين على ما يتعثر فيه الطالب العربي فعلًا.</p>
        <h2>شاشات المنصة</h2>
        <p>الخطة الفردية، المسبار الأسبوعي، الأنشطة، تقارير الأسرة، مكتبة المعايير، ملف الطالب. انقر أي شاشة لتفتح حقيقيتها.</p>
      </div>

      {/* إطار الواجهة الثابت */}
      <header className="ui top">
        <span className="jr-brandword">
          مدارج<i aria-hidden="true" />
        </span>
        <span className="year">٢٠٢٦</span>
      </header>
      <nav className="ui rail" aria-label="مراحل الرحلة">
        <span className="line" />
        <span className="fill" id="railFill" />
      </nav>
      <div className="ui hint" id="hint">
        <span>مرّر لتبدأ الرحلة</span>
        <i />
      </div>
      <footer className="ui bottom">
        <span className="brandword">MADARIJ</span>
        <span className="counter">
          <b id="sceneNo">٠١</b> / <span id="sceneTotal">٠٨</span>
        </span>
      </footer>

      <div id="jr-loader" aria-hidden="true">
        <span className="jr-loader-word">
          مدارج<i />
        </span>
      </div>
    </div>
  )
}
