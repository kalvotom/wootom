import {CompositeDisposable} from 'atom';
import {htmlViewModel, parser, renderingManager} from './core';
import {navigationModel} from './core/navigation/navigation-model';
import {NavigationSubscriber} from './core/navigation/navigation-subscriber';
import {PreviewSubscriber} from './core/preview/preview-subscriber';
import {registerTemplate} from './template';
import {loadMathJax} from './template/mathjax';

export const notificationMessage = 'Wootom was called and says hello!';

let subscriptions: CompositeDisposable;

const navigationSubscriber = new NavigationSubscriber(
    navigationModel,
    parser,
    renderingManager,
    atom.workspace,
);
const previewSubscriber = new PreviewSubscriber(
    htmlViewModel,
    parser,
    renderingManager,
    atom.workspace,
);

export function activate(): void {
    // Events subscribed to in atom's system can be easily cleaned up with a
    // CompositeDisposable
    subscriptions = new CompositeDisposable();

    loadMathJax();
    registerTemplate();
    navigationModel.activate();
    htmlViewModel.activate();
    navigationSubscriber.activate();
    previewSubscriber.activate();

    subscriptions.add(
        atom.commands.add('atom-workspace', {
            'wootom:hello': () => hello(),
            'wootom:toggleNavigation': () => navigationSubscriber.toggle(),
            'wootom:togglePreview': () => previewSubscriber.toggle(),
        }),
    );
}

export function deactivate(): void {
    navigationSubscriber.deactivate();
    previewSubscriber.deactivate();
    subscriptions.dispose();
}

export function serialize(): void {
    // empty
}

export function hello(): void {
    console.log(notificationMessage);
    atom.notifications.addSuccess(notificationMessage);
}

export const config = {
    mathjaxMacros: {
        title: 'MathJax Macros',
        description:
            'Add custom TeX macros to be passed on to MathJax. The' +
            ' value should be a stringified version of the JSON object that' +
            ' is normally given to the MathJax (v2.x) config as the `Macros`' +
            ' option. Might require an editor reload to take effect.',
        type: 'string',
        default: '{"N": "\\\\mathbb{N}",\n' +  // Keep this in sync with
                 '"R": "\\\\mathbb{R}",\n' + // fit-html & fit-pdf templates!
                 '"Z": "\\\\mathbb{Z}",\n' +
                 '"Q": "\\\\mathbb{Q}",\n' +
                 '"R": "\\\\mathbb{R}",\n' +
                 '"CC": "\\\\mathbb{C}",\n' +
                 '"e": "\\\\mathrm{e}",\n' +
                 '"ii": "\\\\mathrm{i}",\n' +
                 '"Re": "\\\\mathrm{Re}\\\\,",\n' +
                 '"Im": "\\\\mathrm{Im}\\\\,",\n' +
                 '"tg": "\\\\mathrm{tg}",\n' +
                 '"ctg": "\\\\mathrm{cotg}",\n' +
                 '"cotg": "\\\\mathrm{cotg}",\n' +
                 '"arctg": "\\\\mathrm{arctg}",\n' +
                 '"arcctg": "\\\\mathrm{arccotg}",\n' +
                 '"ceq": ":=",\n' +
                 '"veps": "\\\\varepsilon",\n' +
                 '"sgn": "\\\\mathrm{sgn}",\n' +
                 '"dt": "\\\\,\\\\mathrm{d}t",\n' +
                 '"dx": "\\\\,\\\\mathrm{d}x",\n' +
                 '"mA": "\\\\mathbf{A}",\n' +
                 '"mB": "\\\\mathbf{B}",\n' +
                 '"mC": "\\\\mathbf{C}",\n' +
                 '"mD": "\\\\mathbf{D}",\n' +
                 '"mE": "\\\\mathbf{E}",\n' +
                 '"mP": "\\\\mathbf{P}",\n' +
                 '"mQ": "\\\\mathbf{Q}",\n' +
                 '"mX": "\\\\mathbf{X}",\n' +
                 '"vx": "\\\\mathbf{x}",\n' +
                 '"vy": "\\\\mathbf{y}",\n' +
                 '"vz": "\\\\mathbf{z}",\n' +
                 '"va": "\\\\mathbf{a}",\n' +
                 '"vb": "\\\\mathbf{b}",\n' +
                 '"vc": "\\\\mathbf{c}",\n' +
                 '"ve": "\\\\mathbf{e}",\n' +
                 '"vu": "\\\\mathbf{u}",\n' +
                 '"vv": "\\\\mathbf{v}",\n' +
                 '"vw": "\\\\mathbf{w}",\n' +
                 '"XX": "\\\\mathcal{X}",\n' +
                 '"YY": "\\\\mathcal{Y}",\n' +
                 '"EE": "\\\\mathcal{E}",\n' +
                 '"ssubset": "\\\\subset\\\\subset",\n' +
                 '"pmat": [ "\\\\left(\\\\!\\\\!\\\\begin{array}{#1}#2\\\\end{array}\\\\!\\\\!\\\\right)", 2 ],\n' +
                 '"logi": "\\\\mkern4mu{\\\\Large\\\\shortmid}\\\\mkern-8mu\\\\raise{0.5pt}=\\\\mkern-8mu{\\\\Large\\\\shortmid}\\\\mkern4mu",\n' +
                 '"thus": "\\\\mkern4mu{\\\\Large\\\\shortmid}\\\\mkern-8mu\\\\raise{0.5pt}=\\\\mkern-8mu\\\\mkern8mu"}'
    },
    tikzPreamble: {
        title: 'TikZ Preamble',
        description:
            'Set custom LaTeX preamble for generating SVGs from TikZ' +
            ' environments. Might require an editor reload to take effect.' +
            ' Note that `\\documentclass[tikz]{standalone}` is always' +
            ' automatically included in the preamble.',
        type: 'string',
        default: '\\usepackage[utf8]{inputenc}\n' +
                 '\\usepackage[T1]{fontenc}\n' +
                 '\\usepackage[czech]{babel}\n' +
                 '\\usepackage{libertine}\n' +
                 '\\usepackage{amsmath}\n' +
                 '\\usepackage{amssymb}\n' +
                 '\\usepackage{tikz}\n' +
                 '\\usepackage{ifthen}\n' +
                 '\\usepackage{pgfplots}\n' +
                 '\\usepackage{bbding}\n' +
                 '\\newcommand{\\N}{\\mathbb{N}}\n' +
                 '\\newcommand{\\Z}{\\mathbb{Z}}\n' +
                 '\\newcommand{\\Q}{\\mathbb{Q}}\n' +
                 '\\newcommand{\\R}{\\mathbb{R}}\n' +
                 '\\newcommand{\\CC}{\\mathbb{C}}\n' +
                 '\\newcommand{\\e}{\\mathrm{e}}\n' +
                 '\\newcommand{\\ii}{\\mathrm{i}}\n' +
                 '\\renewcommand{\\Re}{\\mathrm{Re}\\,}\n' +
                 '\\renewcommand{\\Im}{\\mathrm{Im}\\,}\n' +
                 '\\DeclareMathOperator{\\tg}{\\mathrm{tg}}\n' +
                 '\\DeclareMathOperator{\\ctg}{\\mathrm{cotg}}\n' +
                 '\\DeclareMathOperator{\\cotg}{\\mathrm{cotg}}\n' +
                 '\\DeclareMathOperator{\\arctg}{\\mathrm{arctg}}\n' +
                 '\\DeclareMathOperator{\\arcctg}{\\mathrm{arccotg}}\n' +
                 '\\newcommand{\\ceq}{\\mathrel{\\mathop:}=}\n' +
                 '\\newcommand{\\veps}{\\varepsilon}\n' +
                 '\\DeclareMathOperator{\\sgn}{\\mathrm{sgn}}\n' +
                 '\\newcommand{\\dx}{\\,\\mathrm{d}x}\n' +
                 '\\newcommand{\\dt}{\\,\\mathrm{d}t}\n' +
                 '% matrices and vectors\n' +
                 '\\newcommand{\\mA}{\\mathbf{A}}\n' +
                 '\\newcommand{\\mB}{\\mathbf{B}}\n' +
                 '\\newcommand{\\mC}{\\mathbf{C}}\n' +
                 '\\newcommand{\\mD}{\\mathbf{D}}\n' +
                 '\\newcommand{\\mE}{\\mathbf{E}}\n' +
                 '\\newcommand{\\mP}{\\mathbf{P}}\n' +
                 '\\newcommand{\\mQ}{\\mathbf{Q}}\n' +
                 '\\newcommand{\\mX}{\\mathbf{X}}\n' +
                 '\\newcommand{\\vx}{\\mathbf{x}}\n' +
                 '\\newcommand{\\vy}{\\mathbf{y}}\n' +
                 '\\newcommand{\\vz}{\\mathbf{z}}\n' +
                 '\\newcommand{\\va}{\\mathbf{a}}\n' +
                 '\\newcommand{\\vb}{\\mathbf{b}}\n' +
                 '\\newcommand{\\vc}{\\mathbf{c}}\n' +
                 '\\newcommand{\\ve}{\\mathbf{e}}\n' +
                 '\\newcommand{\\vu}{\\mathbf{u}}\n' +
                 '\\newcommand{\\vv}{\\mathbf{v}}\n' +
                 '\\newcommand{\\vw}{\\mathbf{w}}\n' +
                 '\\newcommand{\\XX}{\\mathcal{X}}\n' +
                 '\\newcommand{\\YY}{\\mathcal{Y}}\n' +
                 '\\newcommand{\\EE}{\\mathcal{E}}\n' +
                 '\\newcommand{\\ssubset}{\\subset\\subset}\n' +
                 '% matrices with vertical lines\n' +
                 '\\newcommand{\\pmat}[2]{\\left(\\!\\!\\begin{array}{#1}#2\\end{array}\\!\\!\\right)}\n' +
                 '\\usetikzlibrary{\n' +
                 '  shapes.geometric,\n' +
                 '  calc,\n' +
                 '  arrows,\n' +
                 '  decorations.markings,\n' +
                 '  decorations.pathmorphing\n' +
                 '}\n' +
                 '\\pgfplotsset{\n' +
                 '  % all plots are thick and without point marks\n' +
                 '  every axis plot/.append style={\n' +
                 '    thick,\n' +
                 '    mark=none,\n' +
                 '    smooth\n' +
                 '  },\n' +
                 '  % axis style\n' +
                 '  every axis/.append style={\n' +
                 '    axis lines=middle,\n' +
                 '    axis line style={->,thick},\n' +
                 '    grid=major,\n' +
                 '    minor tick num=1,\n' +
                 '    tick label style={font=\\footnotesize,fill=white,opacity=0.5,text opacity=1.0}\n' +
                 '  },\n' +
                 '  % grid style\n' +
                 '  every axis grid/.style={\n' +
                 '    thin,\n' +
                 '    gray,\n' +
                 '    dashed\n' +
                 '  },\n' +
                 '  % legend style\n' +
                 '  every axis legend/.append style={\n' +
                 '    at={(1.1,0.5)},\n' +
                 '    anchor=west,\n' +
                 '    %legend pos=outer east,\n' +
                 '    %legend columns=2,\n' +
                 '    cells={anchor=west},\n' +
                 '    font=\\footnotesize,\n' +
                 '    rounded corners=2pt\n' +
                 '  },\n' +
                 '  xlabel={$x$},ylabel={$y$}\n' +
                 '}',
    },
    tikzSvgStyle: {
        title: 'TikZ SVG Style',
        description:
            'The style of the SVG images generated from TikZ' +
            ' environments. Requires a rerender to take effect.',
        type: 'string',
        default: 'whiteboard',
        enum: [
            {
                value: 'inverted',
                description: 'Inverted colors',
            },
            {
                value: 'whiteboard',
                description: 'White background',
            },
            {
                value: 'raw',
                description: 'No background or color modification',
            },
        ],
    },
    updateOnType: {
        title: 'Update on Type',
        description:
            'Update the WooWoo HTML preview and the Navigation panes (also)' +
            ' on type. If `false`, the preview will be updated only when a' +
            ' new file is opened and when a file is saved.',
        type: 'boolean',
        default: true,
    },
};
