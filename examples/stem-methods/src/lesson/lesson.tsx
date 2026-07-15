import { LinearCourse } from "@faraday-academy/kit/runtime";
import CraCpa from "./nodes/cra-cpa";
import PolyaProblemSolving from "./nodes/polya-problem-solving";
import VariationTheory from "./nodes/variation-theory";
import ModelingInstruction from "./nodes/modeling-instruction";
import Pogil from "./nodes/pogil";
import PredictObserveExplain from "./nodes/predict-observe-explain";
import ArgumentDrivenInquiry from "./nodes/argument-driven-inquiry";
import ProblemBasedLearning from "./nodes/problem-based-learning";
import ProjectChallengeLearning from "./nodes/project-challenge-learning";
import EngineeringDesignCycle from "./nodes/engineering-design-cycle";
import ComputationalThinking from "./nodes/computational-thinking";
import Primm from "./nodes/primm";
import GaiseInvestigation from "./nodes/gaise-investigation";
import SimulationBasedInference from "./nodes/simulation-based-inference";
import InquiryBasedLearning from "./nodes/inquiry-based-learning";

export default function StemMethodsCourse() {
  return (
    <LinearCourse
      title="STEM instructional methods"
      chapters={[
        { slug: "cra-cpa", title: "CRA / CPA", element: <CraCpa /> },
        {
          slug: "polya-problem-solving",
          title: "Polya problem solving",
          element: <PolyaProblemSolving />,
        },
        {
          slug: "variation-theory",
          title: "Variation theory",
          element: <VariationTheory />,
        },
        {
          slug: "modeling-instruction",
          title: "Modeling Instruction",
          element: <ModelingInstruction />,
        },
        { slug: "pogil", title: "POGIL", element: <Pogil /> },
        {
          slug: "predict-observe-explain",
          title: "Predict–Observe–Explain",
          element: <PredictObserveExplain />,
        },
        {
          slug: "argument-driven-inquiry",
          title: "Argument-driven inquiry",
          element: <ArgumentDrivenInquiry />,
        },
        {
          slug: "problem-based-learning",
          title: "Problem-based learning",
          element: <ProblemBasedLearning />,
        },
        {
          slug: "project-challenge-learning",
          title: "Project / challenge learning",
          element: <ProjectChallengeLearning />,
        },
        {
          slug: "engineering-design-cycle",
          title: "Engineering design cycle",
          element: <EngineeringDesignCycle />,
        },
        {
          slug: "computational-thinking",
          title: "Computational thinking",
          element: <ComputationalThinking />,
        },
        { slug: "primm", title: "PRIMM", element: <Primm /> },
        {
          slug: "gaise-investigation",
          title: "GAISE investigation",
          element: <GaiseInvestigation />,
        },
        {
          slug: "simulation-based-inference",
          title: "Simulation-based inference",
          element: <SimulationBasedInference />,
        },
        {
          slug: "inquiry-based-learning",
          title: "Inquiry-based learning",
          element: <InquiryBasedLearning />,
        },
      ]}
    />
  );
}
