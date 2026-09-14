(function renderCurriculum() {
  'use strict';

  const data = window.WebDevGymCurriculumData;
  if (!data || !Array.isArray(data.sections)) {
    console.error('[WebDevGym] Curriculum data is missing.');
    return;
  }

  const template = document.createElement('template');
  let renderedLessons = 0;
  const missingSections = [];

  data.sections.forEach(sectionData => {
    const section = document.getElementById(sectionData.id);
    const slot = section && section.querySelector(
      `[data-curriculum-slot="${sectionData.id}"]`
    );

    if (!section || !slot) {
      missingSections.push(sectionData.id);
      return;
    }

    const fragment = document.createDocumentFragment();
    sectionData.lessons.forEach(lesson => {
      template.innerHTML = lesson.html.trim();
      Array.from(template.content.childNodes).forEach(node => {
        fragment.appendChild(node);
      });
      renderedLessons += 1;
    });

    slot.replaceWith(fragment);
  });

  window.WebDevGymCurriculumReady = Object.freeze({
    locale: data.locale,
    version: data.version,
    lessons: renderedLessons,
    missingSections: missingSections.slice()
  });

  if (missingSections.length) {
    console.error('[WebDevGym] Missing curriculum slots:', missingSections);
  }

  document.dispatchEvent(new CustomEvent('webdevgym:curriculum-ready', {
    detail: window.WebDevGymCurriculumReady
  }));
})();
