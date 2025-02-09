import Image from "next/image";
import { ButtonItem } from "@/lib/types";
import Markdown from 'markdown-to-jsx';
import parse, { HTMLReactParserOptions, Element, domToReact, DOMNode } from 'html-react-parser';

import "./styles.css";
import { useEffect } from "react";
import { useState } from "react";

/**
 * Render preview box for a message
 * @param postText - Text of the message in Markdown format
 * @param media - Array of media URLs (TODO)
 * @param buttons - Array of button rows
 */
export const TelegramMessagePreview = (props: {
  media: any[];
  postText: string;
  buttons?: ButtonItem[][];
  parseMode: 'HTML' | 'MarkdownV2';
}) => {

  const [textToRender, setTextToRender] = useState(props.postText);

  // HTML parsing options
  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (domNode instanceof Element) {
        if (domNode.name === 'a') {
          return (
            <a
              href={domNode.attribs.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0088cc] hover:underline"
            >
              {domToReact(domNode.children as DOMNode[])}
            </a>
          );
        }
        if (domNode.name === 'p') {
          return (
            <span>{domToReact(domNode.children as DOMNode[])}</span>
          );
        }
      }
    }
  };

  useEffect(() => {
    if(props.parseMode == 'HTML') {
      setTextToRender(props.postText.replace(/\n/g, '<br/>'));
    } else {
      setTextToRender(props.postText);
    }
  }, [props.postText, props.parseMode]);

  return (
    <div className="w-full relative rounded-[16px] overflow-hidden flex flex-col max-h-full ">

      <div
        className="chat flex-grow flex flex-col py-[16px] px-[32px] items-start overflow-y-auto justify-end"
      >
        <div className="chat-bg"></div>

        <div
          id="message-wrapper"
          className="message-wrapper relative max-w-[90%] lg:max-w-[70%] min-w-[150px]"
        >
          <div
            className="message-content bg-white rounded-[12px] shadow-[0_1px_2px_rgba(16,35,47,0.15)]"
            style={
              !props.buttons || props.buttons.length === 0
                ? {
                    borderBottomLeftRadius: "0px",
                  }
                : {}
            }
          >
            {!!props.media.length && props.media && (
              <div className="media-container rounded-t-[12px] overflow-hidden">
                <img
                  src={props.media[0]}
                  className="w-full object-cover max-h-[400px]"
                  alt=""
                />
              </div>
            )}

            <div className="message-text-content p-[6px_12px] text-[15px] leading-[19px]">

              {/* The message text */}
              <div className="message-text break-words">
                {props.parseMode === 'HTML' ? (
                  parse(textToRender, options)
                ) : (
                  <Markdown 
                    children={textToRender} 
                  />
                )}
              </div>

              <div className="message-time text-right mt-1">
                <span className="text-[12px] leading-[14px] text-[#707579]">
                  9:06 PM
                </span>
              </div>
            </div>
          </div>

          {/* Message appendix (triangle) */}
          {!props.buttons || props.buttons.length === 0 ? (
            <svg
              width="9"
              height="20"
              className="absolute bottom-[-3px] left-[-9px]"
            >
              <defs>
                <filter
                  x="-50%"
                  y="-14.7%"
                  width="200%"
                  height="141.2%"
                  filterUnits="objectBoundingBox"
                  id="messageAppendix"
                >
                  <feOffset
                    dy="1"
                    in="SourceAlpha"
                    result="shadowOffsetOuter1"
                  ></feOffset>
                  <feGaussianBlur
                    stdDeviation="1"
                    in="shadowOffsetOuter1"
                    result="shadowBlurOuter1"
                  ></feGaussianBlur>
                  <feColorMatrix
                    values="0 0 0 0 0.0621962482 0 0 0 0 0.138574144 0 0 0 0 0.185037364 0 0 0 0.15 0"
                    in="shadowBlurOuter1"
                  ></feColorMatrix>
                </filter>
              </defs>
              <g fill="none" fillRule="evenodd">
                <path
                  d="M3 17h6V0c-.193 2.84-.876 5.767-2.05 8.782-.904 2.325-2.446 4.485-4.625 6.48A1 1 0 003 17z"
                  fill="#000"
                  filter="url(#messageAppendix)"
                ></path>
                <path
                  d="M3 17h6V0c-.193 2.84-.876 5.767-2.05 8.782-.904 2.325-2.446 4.485-4.625 6.48A1 1 0 003 17z"
                  fill="#fff"
                  className="corner"
                ></path>
              </g>
            </svg>
          ) : null}

          <div id="buttons-container" className="flex flex-col">
            {props.buttons &&
              props.buttons.map((row, rowIndex) => (
                <div key={rowIndex} className="grid grid-flow-col">
                  {row.map((button, buttonIndex) => (
                    <button key={buttonIndex} className="chat-message-button">
                      <span style={{ color: '#fff', fontWeight: 500 }}>{button.text}</span>
                    </button>
                  ))}
                </div>
              ))}
          </div>

        </div>
      </div>
    </div>
  );
};
