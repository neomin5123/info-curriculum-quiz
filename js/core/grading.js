(function(){
  const CL=window.CurriLoop=window.CurriLoop||{};
  function norm(v){return String(v||'').normalize('NFKC').trim().toLowerCase().replace(/\s+/g,'').replace(/[·⋅ㆍ,，.。;:!?()[\]{}<>/'"“”‘’_\-–—]/g,'');}
  function exact(a,b){return norm(a)===norm(b);}
  function gradeSet(inputs,answers){
    const expected=new Map(answers.map((a,i)=>[norm(a),{answer:a,index:i}]));
    const seen=new Set(); const results=[]; const matched=new Set();
    inputs.forEach((value,i)=>{const n=norm(value);let status='wrong',answerIndex=null;if(!n)status='empty';else if(seen.has(n))status='duplicate';else if(expected.has(n)){status='correct';answerIndex=expected.get(n).index;matched.add(n);}seen.add(n);results.push({inputIndex:i,status,answerIndex,value});});
    return {correct:matched.size===expected.size && seen.size===expected.size,matchedCount:matched.size,total:expected.size,results,matchedKeys:[...matched]};
  }
  CL.grading={norm,exact,gradeSet};
})();
