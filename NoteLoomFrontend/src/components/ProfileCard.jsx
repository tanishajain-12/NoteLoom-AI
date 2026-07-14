import Button from './Button'
import { Mail, Calendar, FileText } from '../icons'

function ProfileCard({ user }) {
  const { name, email, joinedDate, totalNotes, avatar } = user

  return (
    <div className="rounded-2xl bg-white border border-[#e4e2e1] shadow-sm overflow-hidden">
      <div className="h-24 bg-gradient-to-r from-[#ffdad9] to-[#d9e4ec]"></div>
      <div className="px-6 pb-6">
        <div className="flex items-end justify-between -mt-12 mb-4">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#8a4d4e] text-white text-3xl font-bold border-4 border-white shadow-md">
            {avatar}
          </div>
          <Button variant="soft" size="sm" to="/settings">Edit Profile</Button>
        </div>

        <h2 className="font-display text-2xl font-bold text-[#1b1c1c]">{name}</h2>

        <div className="mt-4 space-y-2.5">
          <div className="flex items-center gap-2.5 text-sm text-[#524343]">
            <Mail className="w-4 h-4 text-[#857372]" />
            {email}
          </div>
          <div className="flex items-center gap-2.5 text-sm text-[#524343]">
            <Calendar className="w-4 h-4 text-[#857372]" />
            Joined {joinedDate}
          </div>
          <div className="flex items-center gap-2.5 text-sm text-[#524343]">
            <FileText className="w-4 h-4 text-[#857372]" />
            {totalNotes} notes summarized
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileCard
