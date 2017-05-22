/*
 * Copyright 2017 kkpoon
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export type MessageSender =
    (recipientId: string) => Promise<any>;

export type TextMessageSender =
    (recipientId: string) => (text: string) => Promise<any>;

export type TextMessageWithQuickRepliesSender =
    (recipientId: string) => (text: string) => (replies: QuickReply[]) => Promise<any>;

export type AudioMessageSender =
    (recipientId: string) => (audio: ReadableStream) => Promise<any>;

export interface QuickReply {
    content_type: string;
    title?: string;
    payload?: string;
    image_url?: string;
}
