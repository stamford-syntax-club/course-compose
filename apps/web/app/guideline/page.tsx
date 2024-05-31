"use client";
import React, { useState } from "react";
import { guideline, aspects, plus, minus, book, key, list } from "./data";
import { Container, Text, Title } from "@mantine/core";

interface Aspects {
  title: string;
  info: string;
}

interface Guideline {
  title: string;
  rule1?: string;
  rule2?: string;
  rule3?: string;
  rule4?: string;
}

export default function Guideline(): JSX.Element {
  const [openItem, setOpenItem] = useState<number[]>([]);

  const handleclick = (index: number) => {
    setOpenItem((previous) => {
      if (previous.includes(index)) {
        return previous.filter((i) => i !== index);
      } else {
        return [...previous, index];
      }
    });
  };

  return (
    <Container>
      <div className="max-w-4xl mx-auto px-4 pb-4">
        <Title order={2} fw={700} className="flex items-center justify-center mb-6 gap-2">
          <span className=" animate-bounce">{book}</span>
          Guidelines for Writing Course Reviews
          <span className=" animate-bounce">{book}</span>
        </Title>
        <Text c={"rgba(156, 163, 175, 1)"} className="mb-8">
          While reviews are helpful, always consult with your academic advisors when selecting courses. This platform is
          intended to supplement their guidance with student experiences. Remember that reading reviews is useful, but
          you must study according to your curriculum and requirements.
        </Text>
        <div className="mb-9">
          <Title order={2} fw={700} className="flex items-center justify-center mb-6 gap-2">
            <span className=" animate-bounce">{key}</span>
            Consider Key Aspects of the Course
            <span className=" animate-bounce">{key}</span>
          </Title>
          {aspects?.map((info: Aspects, index) => (
            <div className="mb-7" key={index}>
              <Title order={4} fw={700} className="flex items-center gap-2 mb-2">
                {list}
                {info.title}
              </Title>
              <Text c={"rgba(156, 163, 175, 1)"}>{info.info}</Text>
            </div>
          ))}
        </div>
        {guideline?.map((list: Guideline, index: number) => (
          <div
            className={`mb-6 rounded-md ${openItem.includes(index) ? "" : "bg-white text-black"}`}
            onClick={() => handleclick(index)}
            key={index}
          >
            <div
              className={`flex select-none cursor-pointer justify-between items-center px-3 py-3 shadow-lg ${
                openItem.includes(index) ? "bg-blue-600 rounded-md text-white" : ""
              }`}
            >
              <Title order={4} fw={600}>
                {list.title}
              </Title>
              {openItem.includes(index) ? (
                <span className=" cursor-pointer">{minus}</span>
              ) : (
                <span className=" cursor-pointer">{plus}</span>
              )}
            </div>
            {openItem.includes(index) && (
              <ul className="list-disc pl-6">
                {list.rule1 && <li className="mb-2">{list.rule1}</li>}
                {list.rule2 && <li className="mb-2">{list.rule2}</li>}
                {list.rule3 && <li className="mb-2">{list.rule3}</li>}
                {list.rule4 && <li className="mb-2">{list.rule4}</li>}
              </ul>
            )}
          </div>
        ))}
      </div>
    </Container>
  );
}