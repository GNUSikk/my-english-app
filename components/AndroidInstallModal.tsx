import React from 'react';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => void;
  isInstallSupported: boolean;
}

const CloseIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const AndroidLogo: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.63 13.92a.96.96 0 1 1-1.91 0 .96.96 0 0 1 1.91 0zm-7.34 0a.96.96 0 1 1-1.91 0 .96.96 0 0 1 1.91 0zm8.38-4.47l1.52-2.63a.47.47 0 0 0-.17-.64.47.47 0 0 0-.64.17l-1.54 2.67a11.16 11.16 0 0 0-9.68 0L7.18 6.35a.47.47 0 0 0-.64-.17.47.47 0 0 0-.17.64l1.52 2.63A11.37 11.37 0 0 0 2 15.69h20a11.37 11.37 0 0 0-5.83-6.24zM5.5 17.5h13v.83h-13V17.5z" />
  </svg>
);

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({
  isOpen,
  onClose,
  onInstall,
  isInstallSupported
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800 sticky top-0 z-10">
          <div className="flex items-center space-x-2 text-emerald-400">
            <AndroidLogo className="w-6 h-6 animate-pulse" />
            <span className="text-lg font-bold">Установка на Android</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
            aria-label="Закрыть окно"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="text-center">
            <div className="inline-block p-4 bg-emerald-500/10 rounded-full text-emerald-400 mb-3 border border-emerald-500/20">
              <AndroidLogo className="w-12 h-12" />
            </div>
            <h3 className="text-lg font-semibold text-slate-100">Запустите в один клик с экрана смартфона!</h3>
            <p className="text-sm text-slate-400 mt-1">
              Установите EduAudio Scribe как нативное приложение Android и учите языки с полным комфортом.
            </p>
          </div>

          {/* Interactive Install Action */}
          {isInstallSupported ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-5 text-center space-y-3">
              <p className="text-sm text-emerald-300 font-medium">
                ✨ Ваше устройство полностью поддерживает автоматическую установку!
              </p>
              <button
                onClick={onInstall}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-md hover:shadow-emerald-900/30 transition-all transform active:scale-95 flex items-center justify-center space-x-2"
              >
                <AndroidLogo className="w-5 h-5" />
                <span>Установить приложение</span>
              </button>
            </div>
          ) : (
            <div className="bg-slate-700/50 border border-slate-600/50 rounded-lg p-4 space-y-3">
              <h4 className="text-sm font-semibold text-emerald-400 flex items-center space-x-1.5">
                <span>📱 Простая ручная установка</span>
              </h4>
              <p className="text-xs text-slate-300">
                Автоматический запуск недоступен на этом устройстве, но вы можете добавить его вручную за 3 секунды:
              </p>
              <div className="space-y-3 mt-2 text-sm text-slate-200">
                <div className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full mt-0.5">1</span>
                  <span className="text-xs">Нажмите на **кнопку меню** (три вертикальные точки <span className="font-bold text-slate-100">⋮</span>) в верхнем правом углу Google Chrome на телефоне.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full mt-0.5">2</span>
                  <span className="text-xs">Выберите пункт **«Установить приложение»** или **«Добавить на главный экран»**.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full mt-0.5">3</span>
                  <span className="text-xs">Готово! Приложение появится на рабочем столе с красивой иконкой.</span>
                </div>
              </div>
            </div>
          )}

          {/* Key Advantages of the Android Standalone app */}
          <div className="space-y-3 pt-4 border-t border-slate-700/60">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Что дает приложение на Android:</h4>
            <div className="grid grid-cols-1 gap-2 text-xs text-slate-300">
              <div className="flex items-center space-x-2 bg-slate-700/30 p-2.5 rounded-md border border-slate-700">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>**Офлайн работа:** Плеер и фразы работают без интернета</span>
              </div>
              <div className="flex items-center space-x-2 bg-slate-700/30 p-2.5 rounded-md border border-slate-700">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>**Контроль сна:** Экран не гаснет при воспроизведении благодаря Wake Lock</span>
              </div>
              <div className="flex items-center space-x-2 bg-slate-700/30 p-2.5 rounded-md border border-slate-700">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>**Полноэкранный режим:** Нет рамок браузера и лишних вкладок</span>
              </div>
              <div className="flex items-center space-x-2 bg-slate-700/30 p-2.5 rounded-md border border-slate-700">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>**Удобство:** Открывается мгновенно по нажатию на иконку на главном экране</span>
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full mt-2 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-md shadow transition-colors text-sm"
          >
            Закрыть инструкции
          </button>
        </div>
      </div>
    </div>
  );
};
