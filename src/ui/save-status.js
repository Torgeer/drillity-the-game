/** Persistence feedback shared by Menu, Settings and the shell's transition toast. */
export function saveNoticeModel(status) {
  if (!status) return null;
  if (status.blocked) {
    const loaded = status.blocked.loadedFrom
      ? (status.recovered ? 'A backup career is open. ' : 'A compatible saved career is open. ')
      : 'Your saved career has not been loaded. ';
    const keep = ' Current play cannot be saved while this protection is active. Keep this page open and do not clear this site’s saved data.';
    if (status.blocked.reason === 'saved-career-available') return {
      title: 'Saved career ready to load',
      message: 'Saved data is readable again. Reload to open the saved career; unsaved changes from this session will be lost. Existing saved data has not been changed.',
      action: 'Load saved career', reload: true,
    };
    const copy = {
      'newer-save-version': ['Saved career needs a newer game', 'A save was created by a newer game version. Open that version to continue it.'],
      'unreadable-save': ['Saved career could not be recovered', 'No saved copy could be read as a compatible career. Existing saved data is being kept for recovery.'],
      'storage-read-failed': ['Saved data cannot be read', 'The browser prevented access to saved data. Restore this site’s storage access, then check again.'],
    }[status.blocked.reason] || ['Saved career protected', 'Existing saved data is being kept for recovery.'];
    return { title: copy[0], message: loaded + copy[1] + keep,
      action: 'Check saved data', check: true };
  }
  if (status.error) {
    const recovery = status.recovered ? 'Your career was restored from a backup. ' : '';
    return {
      title: 'Progress not saved',
      message: recovery + (status.error === 'serialise-failed'
        ? 'Keep this page open and retry before leaving. The current career could not be prepared for saving.'
        : 'Keep this page open. Allow this site to use browser storage or free device space, then retry. Do not clear this site’s saved data.'),
      action: 'Retry save', retry: true,
    };
  }
  if (status.backupFailed) return {
    title: status.pending ? 'Recovery copy unavailable' : 'Career saved; backup unavailable',
    message: (status.pending ? 'Current changes are waiting to save. ' : 'Your latest progress is saved. ')
      + 'The recovery copy could not be updated. Free device space, then retry without clearing this site’s saved data.',
    action: 'Retry save', retry: true,
  };
  if (status.recovered) return {
    title: 'Career restored from backup',
    message: 'The latest save could not be read. Recent changes may be missing.'
      + (status.pending ? ' The restored career is waiting to save.' : ' The restored career has been saved.'),
    action: status.pending ? 'Retry save' : 'Understood', retry: status.pending,
  };
  return null;
}

export function createSaveNotice(app, onVisibility = () => {}) {
  const { C } = app;
  const progression = app.ctx.progression;
  const title = C.h('strong');
  const message = C.h('p');
  let model = null;
  let confirmingReload = false;
  let destroyed = false;
  // Native click supplies pointer, keyboard and assistive activation once.
  const action = C.h('button.btn.btn--quiet', { type: 'button' });
  action.addEventListener('click', async () => {
    if (destroyed) return;
    if (model?.check) progression?.checkSaveProtection?.();
    else if (model?.reload) {
      if (confirmingReload || typeof app.confirm !== 'function') return;
      confirmingReload = true;
      try {
        const confirmed = await app.confirm({ title: 'Load saved career?',
          message: 'Reload the game to open your saved career. Unsaved changes from this session will be lost. Your saved data will be kept.',
          confirmLabel: 'Load saved career', cancelLabel: 'Keep this session' });
        if (confirmed && !destroyed && model?.reload) {
          // Protection can change while the confirmation is open (for example,
          // another tab writes a newer save). Do not act on a stale notice.
          progression?.checkSaveProtection?.();
          if (model?.reload) globalThis.location?.reload();
        }
      } finally { confirmingReload = false; }
    } else if (model?.retry) progression?.save?.();
    else progression?.acknowledgeSaveRecovery?.();
  });
  const el = C.h('div.save-notice',
    C.h('div', { role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' }, title, message), action);
  const render = (status) => {
    model = saveNoticeModel(status);
    el.hidden = !model;
    onVisibility(!!model);
    if (!model) return;
    title.textContent = model.title;
    message.textContent = model.message;
    action.textContent = model.action;
  };
  const unsubscribe = typeof progression?.subscribeSaveStatus === 'function'
    ? progression.subscribeSaveStatus(render)
    : (render(progression?.getSaveStatus?.()), null);
  return { el, destroy: () => { destroyed = true; unsubscribe?.(); } };
}

/** One toast per problem transition, independent of frame count/retry count. */
export function subscribeSaveFeedback(progression, toast) {
  let previous = null;
  return progression?.subscribeSaveStatus?.((status) => {
    if (status.blocked) {
      if (status.blocked.reason !== previous?.blocked?.reason) {
        toast(status.blocked.reason === 'saved-career-available'
          ? 'Saved career available. Open Settings to load it; this session has not been saved.'
          : 'Saved career protected. Current play cannot be saved. See Settings.',
        'warn', { key: 'save-status' });
      }
    } else if (status.error) {
      // An unchanged primary failure still takes precedence over a newly
      // failed backup. No successful-save wording may escape this branch.
      if (status.error !== previous?.error) {
        toast('Progress not saved. Open Settings to retry before leaving.', 'danger', { key: 'save-status' });
      }
    } else if (status.backupFailed && (!previous?.backupFailed || previous?.error)) {
      toast(status.pending
        ? 'Changes are waiting to save, and the recovery copy could not be updated. See Settings.'
        : 'Career saved, but its recovery copy could not be updated. See Settings.', 'warn', { key: 'save-status' });
    } else if (status.recovered && !previous?.recovered) {
      toast('Career restored from backup. Recent changes may be missing.', 'warn', { key: 'save-status' });
    } else if (previous?.error && !status.error && !status.pending) {
      toast('Career saved.', 'success', { key: 'save-status' });
    }
    previous = status;
  }) || (() => {});
}
