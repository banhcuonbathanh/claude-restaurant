import { redirect } from 'next/navigation'

// The dedicated "Bộ đã lưu" page was removed — saved suất now live directly in
// /menu/favourites and the menu rail. This stub bounces any old bookmark/link there.
// (Folder kept only because file deletion is blocked in this environment — safe to
//  `rm -rf` the whole sets/ folder.)
export default function SetsPageRedirect() {
  redirect('/menu/favourites')
}
