import logo from '../resources/img/neowatchlogo.png'
import iconAlert from '../resources/img/icon-alert.png'
import { Button, Link } from '../components/BasicComponents'

export default function Unauthorized() {
  return (
    <div className="!text-white flex fixed bg-secondary justify-center h-screen w-screen">
      <div className='w-full p-8 color-primary mt-12'>
        <img
          className='w-96 mx-auto h-auto mb-3'
          src={logo}
        />
        <div className='flex justify-center'>
          <img
            className='w-12 h-12 filter-white'
            src={iconAlert}
          />
          <span className='font-semibold my-auto text-3xl ml-2'>Error 401 - Unauthorized.</span>
        </div>
        <Button className="mt-10 font-semibold flex mx-auto text-xl rounded-md">
          <Link route='/' className='px-4 py-2 !no-underline !text-white'>
            Back to Main Page
          </Link>
        </Button>
      </div>
    </div>
  );
}