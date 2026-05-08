import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-chat-message-attachment',
  template: `
    @if (fileUrl().length > 0) {
      <div
        class="cursor-pointer flex items-center justify-center p-2 border-4 border-[#e6e6e6] rounded-xl ml-2 relative w-[200px] h-[200px] overflow-hidden bg-white transition-all duration-[125ms] [&:hover_.uploaded-img]:scale-[1.02]"
      >
        <img
          [src]="fileUrl()"
          alt=""
          class="uploaded-img absolute w-[200px] h-[200px] object-contain transition-all duration-[125ms]"
          (click)="previewToggled.emit()"
        />
      </div>
    }

    @if (showPreview()) {
      <div class="fixed inset-0 bg-black/15 flex items-center justify-center z-[99]">
        <div
          class="flex items-center justify-center bg-white p-6 rounded-[25px] border-4 border-[#e6e6e6] w-[40%] relative hover:[&_.link]:opacity-90 max-[960px]:w-[55%] max-[690px]:w-[75%] max-[420px]:w-[95%]"
        >
          <img [src]="fileUrl()" alt="" class="w-full h-full object-contain" />
          <a
            [href]="fileUrl()"
            download="download.image.png"
            target="_blank"
            class="link absolute z-[100] opacity-0 cursor-pointer rounded-full p-2 bg-[#e6e6e6] transition-all duration-[125ms]"
            ><img src="assets/icons/download_icon.png" alt="" class="w-16 h-16"
          /></a>
          <img
            src="assets/icons/close.svg"
            alt=""
            class="close-icon cursor-pointer absolute top-6 right-6 p-1 rounded-full transition-all duration-[125ms] hover:bg-[#ECEEFE] hover:scale-[1.2]"
            (click)="previewToggled.emit()"
          />
        </div>
      </div>
    }
  `,
})
export class ChatMessageAttachmentComponent {
  readonly fileUrl = input.required<string>();
  readonly showPreview = input<boolean>(false);
  readonly previewToggled = output<void>();
}
